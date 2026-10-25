import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiUrl, token } from "../../Common/http";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { useTranslation } from "react-i18next";
import { COURSE_ROUTES } from "../../../constants/nevigation/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Hls from "hls.js";


const HLSVideoPlayer = ({ getUrl }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // Stores the latest Bunny signed URL
  const signedUrlRef = useRef(null);

  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setVideoError("");
    setLoadingVideo(true);
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    let cancelled = false;

    // Video Loading and stop spinner on  error 
    let startupTimer;
    const failVideo = (message) => {
      if (cancelled) return;

      clearTimeout(startupTimer);
      setLoadingVideo(false);
      setVideoError(message);
    };

    startupTimer = setTimeout(() => {
      failVideo(
        "Video is taking too long to load. Please check your connection and try again."
      );
    }, 120000);

    /*
     * Replace the old Bunny token/expires in a segment URL
     * with the newest token/expires.
     *
     * We keep the original segment path.
     */
    const updateSignedSegmentUrl = (originalUrl) => {
      const latestUrl = signedUrlRef.current;

      if (!latestUrl) {
        return originalUrl;
      }

      try {
        const latest = new URL(latestUrl);
        const original = new URL(originalUrl);

        /*
         * Bunny's token is part of the pathname.
         *
         * Example:
         *
         * /bcdn_token=ABC&expires=123&token_path=.../segment.ts
         */

        const latestPath = latest.pathname;

        const tokenMatch = latestPath.match(
          /bcdn_token=([^&]+)/
        );

        const expiresMatch = latestPath.match(
          /expires=([^&]+)/
        );

        if (!tokenMatch || !expiresMatch) {
          console.warn(
            "Could not extract Bunny token from signed URL"
          );

          return originalUrl;
        }

        const newToken = tokenMatch[1];
        const newExpires = expiresMatch[1];

        /*
         * Preserve everything after token_path=
         * from the ORIGINAL segment request.
         *
         * This keeps segment_006.ts,
         * segment_012.ts, etc.
         */

        const tokenPathIndex =
          original.pathname.indexOf("token_path=");

        if (tokenPathIndex === -1) {
          return originalUrl;
        }

        const tokenPath =
          original.pathname.substring(tokenPathIndex);

        const newPath =
          `/bcdn_token=${newToken}&expires=${newExpires}&${tokenPath}`;

        return `${original.origin}${newPath}`;
      } catch (error) {
        console.error(
          "Failed to update signed segment URL:",
          error
        );

        return originalUrl;
      }
    };


    /*
     * Schedule next token refresh.
     */
    const scheduleRefresh = (
      expiresIn,
      refreshFunction
    ) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const refreshAfter = Math.max(
        30,
        (expiresIn - 60) * 1000
      );

      console.log(
        `HLS token refresh scheduled in ${
          refreshAfter / 1000
        }s`
      );

      refreshTimerRef.current = setTimeout(
        refreshFunction,
        refreshAfter
      );
    };


    /*
     * Refresh Bunny signed URL.
     *
     * IMPORTANT:
     * We do NOT call hls.loadSource() here.
     */
    const refreshHls = async () => {
      try {
        console.log("🔄 Refreshing HLS token...");

        const response = await getUrl();

        if (cancelled) return;

        const {
          url,
          expires_in
        } = response;

        console.log("✅ New HLS URL received");

        /*
         * Just update the latest signed URL.
         *
         * The HLS player itself continues playing.
         */
        signedUrlRef.current = url;

        scheduleRefresh(
          expires_in,
          refreshHls
        );

      } catch (error) {
        console.error(
          "❌ HLS token refresh failed:",
          error
        );

        /*
         * Try again after 30 seconds if refresh failed.
         */
        if (!cancelled) {
          refreshTimerRef.current =
            setTimeout(
              refreshHls,
              30000
            );
        }
      }
    };


    /*
     * Start HLS player.
     */
    const startPlayer = async () => {
      try {
        setLoadingVideo(true);
        setVideoError("");

        console.log(
          "Getting initial HLS URL..."
        );

        const response = await getUrl();

        if (cancelled) return;

        if (!response?.url) {
          throw new Error("The Video URL could not be retrieved.");
        }

        const {
          url,
          expires_in
        } = response;

        console.log(
          "✅ Initial HLS URL received"
        );

        console.log(
          "Expires in:",
          expires_in
        );

        /*
         * Store initial signed URL.
         */
        signedUrlRef.current = url;

        const video = videoRef.current;

        if (!video) return;


        /*
         * Safari native HLS
         */
        if (
          video.canPlayType(
            "application/vnd.apple.mpegurl"
          )
        ) {
          video.src = url;

          video.addEventListener(
            "loadedmetadata",
            () => {
              setLoadingVideo(false);
            },
            { once: true }
          );
        }


        /*
         * Chrome / Firefox / Edge
         */
        else if (Hls.isSupported()) {

          /*
           * Custom fragment loader.
           *
           * hls.js will still manage playback,
           * buffering and MediaSource normally.
           *
           * We only modify the URL before
           * the fragment is downloaded.
           */
          class SignedFragmentLoader
            extends Hls.DefaultConfig.loader {

            load(
              context,
              config,
              callbacks
            ) {

              /*
               * Replace old Bunny token
               * with newest token.
               */
              context.url =
                updateSignedSegmentUrl(
                  context.url
                );

              console.log(
                "📦 Loading segment:",
                context.url
              );

              /*
               * Let normal hls.js loader
               * perform the actual request.
               */
              super.load(
                context,
                config,
                callbacks
              );
            }
          }


          const hls = new Hls({
            fLoader: SignedFragmentLoader,
          });

          hlsRef.current = hls;

          /*
           * Initial source.
           */
          hls.loadSource(url);

          hls.attachMedia(video);


          /*
           * Manifest loaded.
           */
          hls.on(
            Hls.Events.MANIFEST_PARSED,
            () => {
              
              console.log(
                "✅ HLS manifest loaded"
              );
              
              if (cancelled) return;

              clearTimeout(startupTimer);
              setLoadingVideo(false);
              setVideoError("");
            }
          );


          /*
           * Detailed error logging.
           */
          hls.on(
            Hls.Events.ERROR,
            (event, data) => {
              console.error(
                "🔥 HLS ERROR:",
                {
                  type: data.type,
                  details: data.details,
                  fatal: data.fatal,
                  url: data.frag?.url,
                  frag: data.frag,
                  response: data.response,
                  networkDetails:
                    data.networkDetails,
                }
              );

              if (data.fatal) {
                failVideo(" Unable to play this video. The video server may be unavailable. Please  try again later. ");
                hls.destroy();

                hlsRef.current=null;
              }
            }
          );
        }


        else {
          console.error(
            "HLS not supported"
          );

          setLoadingVideo(false);
        }


        /*
         * Schedule first refresh.
         */
        scheduleRefresh(
          expires_in,
          refreshHls
        );

      } catch (error) {
        console.error(
          "❌ HLS start error:",
          error
        );

        failVideo ("Unable to load the video. PLease check your connection and try again.")
        // setLoadingVideo(false);
      }
    };


    startPlayer();


    /*
     * Cleanup.
     */
    return () => {
      cancelled = true;
      clearTimeout(startupTimer);

      if (refreshTimerRef.current) {
        clearTimeout(
          refreshTimerRef.current
        );
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.removeAttribute(
          "src"
        );

        videoRef.current.load();
      }
    };

  }, [getUrl, retryCount]);


  return (
    <div
        className="position-relative w-100 h-100 rounded"
        style={{
          background: videoError ? "#f8f9fa" : "#000",
        }}
      >
      {loadingVideo && !videoError && (
        <div className="position-absolute top-50 start-50 translate-middle text-center">
        <div
          className="spinner-border text-primary "
          style={{ width: "3rem", height: "3rem" }}
        />
          <p className="mt-3 mb-0">Loading video...</p>
        </div>
      )}

      {videoError && (
        <div className="position-absolute top-50 start-50 translate-middle text-center w-75">
          <p className="fw-semibold mb-2">
            Unable to play video
          </p>

          <p className="text-muted small">
            {videoError}
          </p>

          <button
            type="button"
            className="btn blue-btn"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      )}

     {!videoError && (
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-100 h-100 rounded"
          onLoadedMetadata={() => {
            setLoadingVideo(false);
            setVideoError("");
          }}
          onError={() => {
            setLoadingVideo(false);
            setVideoError(
              "The video could not be played. Please try again."
            );
          }}
        />
      )}
    </div>
  );
};


const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lessonError, setLessonError] = useState("");


  // ✅ Fetch all lessons of the course to manage prev/next navigation
  const fetchLessons = async () => {
    try {
      const res = await fetch(`${apiUrl}view-course/${courseId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token()}`,
        },
      });

      const data = await res.json();

      if (data.status && Array.isArray(data.course?.lessons)) {
        setLessons(data.course.lessons);
      } else {
        toast.error("Failed to load lessons list");
      }
    } catch (err) {
      console.error("Fetch lessons error:", err);
      toast.error("Server error while loading lessons");
    }
  };

  // ✅ Fetch current lesson
  const fetchCurrentLesson = async (id) => {
    setLoading(true);
    setLessonError("");
    setCurrentLesson(null);

    try {

      const res = await fetch(`${apiUrl}courses/${courseId}/view-lesson/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      const data = await res.json();

      if (!res.ok || !data.status || !data.lesson) {
        throw new Error(data.message || "Failed to load lesson.");
      }

      setCurrentLesson(data.lesson);

    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching lesson");
    } finally {
      setLoading(false);
    }
  };

// LessonViewer gets the test URL  
const getHlsUrl = useCallback(async () => {

  const res = await fetch(
    `${apiUrl}lessons/${lessonId}/refresh-url`,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(
      `HLS URL request failed: ${res.status}`
    );
  }

  return await res.json();

}, [lessonId]);




  // ✅ Initial load
  useEffect(() => {
    fetchLessons();
    fetchCurrentLesson(lessonId);
  }, [courseId, lessonId]);

  /// handle material download
  const handleDownload = async (material) => {
  try {
    const res = await fetch(
      `${apiUrl}courses/${courseId}/materials/${material.id}/download`,
      {
        headers: {
          Authorization: `Bearer ${token()}`,
          Accept: "application/octet-stream",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Download failed: ${res.status}`);
    }

    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = material.name || "lesson-material";
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to download file");
  }
};

  // ✅ Navigation logic
  const getLessonIndex = () =>
    lessons.findIndex((l) => String(l.id) === String(currentLesson?.id));

  const handlePrev = () => {
    const index = getLessonIndex();
    if (index > 0) {
      const prev = lessons[index - 1];
      navigate(`/admin/course/${courseId}/lesson/${prev.id}/lessonplayer`);
    }
  };

  const handleNext = () => {
    const index = getLessonIndex();
    if (index < lessons.length - 1) {
      const next = lessons[index + 1];
      navigate(`/admin/course/${courseId}/lesson/${next.id}/lessonplayer`);
    }
  };

if (loading) {
  return (
    <div className="dashboard-card mt-4">
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "350px" }}
      >
        <div
          className="spinner-border text-success "
          style={{ width: "3rem", height: "3rem" }}
        />

        <h5 className="mt-3 mb-1">Fetching Lesson Information...</h5>

        <small className="text-muted">
          Please wait while we fetch your lesson information.
        </small>
      </div>
    </div>
  );
}

if (lessonError || !currentLesson) {
  return (
    <div className="dashboard-card my-4 text-center p-5">
      <h5>Unable to load lesson</h5>
      <p className="text-muted">
        {lessonError || "The requested lesson could not be found."}
      </p>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => fetchCurrentLesson(lessonId)}
      >
        Try Again
      </button>

      <button
        type="button"
        className="btn btn-outline-secondary ms-2"
        onClick={() => navigate(`/admin/lesson/${courseId}/course-lessons`)}
      >
        Return to Lessons
      </button>
    </div>
  );
}

  const index = getLessonIndex();
  const isFirst = index === 0;
  const isLast = index === lessons.length - 1;

  return (
    <>
        {/* Breadcrumbs */}
        <div className="d-flex justify-content-between align-items-center">
            <section className="breadcrumb-section px-4 pt-3">
                <h3>Video <span>Player</span></h3>
  
                <Link className='bread-link' to={COURSE_ROUTES.MY_COURSE}>My Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/course/view-course/${courseId}`}>View Course</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to={`/admin/lesson/${courseId}/course-lessons`}>Lesson Management</Link>
                <span><FontAwesomeIcon icon={faAngleRight}/></span>
                <Link className='bread-link' to=""><span>Player</span></Link>
  
            </section>
  
            <Link to={`/admin/lesson/${courseId}/course-lessons`} className="edit-btn">
              <FontAwesomeIcon icon={faArrowLeft} className="icon"/>  Return
            </Link>
        </div>

        <div className="dashboard-card my-4">
          <h3 className="fw-bold text-center mb-4">
            {currentLesson.title?.[i18n.language] || currentLesson.title?.en || "Untitled"}
          </h3>

          {/* HLS video playback */}
            <div
              className="mb-4"
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                minHeight: "260px",
                maxHeight: "650px",
                position: "relative",
              }}
            >
              <HLSVideoPlayer getUrl={getHlsUrl} />
            </div>

          {/* Description and teacher info */}
          <div className="mb-4">
            <h5>Description</h5>
            <p>{currentLesson.description?.[i18n.language] || currentLesson.description?.en || "No description"}</p>

            {currentLesson.teacher && (
              <p className="text-muted">
                <strong>Teacher:</strong> {currentLesson.teacher.name}
              </p>
            )}
          </div>

          {/* Materials */}
          {console.log("materials : ", currentLesson.materials)}
          {currentLesson.materials?.length > 0 && (
            <div className="mb-4">
              <h5>Lesson Materials</h5>
              <ul className="list-group">
                {currentLesson.materials.map((m) => (
                  <li
                    key={m.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{m.name}</span>
                    <div>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        View
                      </a>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={()=>handleDownload(m)}
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={handlePrev}
              disabled={isFirst}
            >
              ⬅ Previous
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={handleNext}
              disabled={isLast}
            >
              Next ➡
            </button>
          </div>
        </div>
    </>
  );
};

export default LessonViewer;