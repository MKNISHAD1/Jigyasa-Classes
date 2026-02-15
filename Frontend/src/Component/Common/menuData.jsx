// menuData.js
export const menuData = [
  {
    title: 'Courses',
    children: [
      {
        title: 'UPSC',
        children: [
          {
            title: 'Prelims',
            children: [
              { title: 'Test 1', link: '/upsc/prelims/test1' },
              { title: 'Test 2', link: '/upsc/prelims/test2' },
            ],
          },
          {
            title: 'Mains', link: '/upsc/mains/essay' },
        ],
      },
      {
        title: 'State Exams',
        children: [
          {
            title: 'BPSC',
            children: [
              { title: 'Prelims', link: '/bpsc/prelims' },
              { title: 'Mains', link: '/bpsc/mains' },
            ],
          },
        ],
      },
        { title: 'UPSC',
        children: [
          {
            title: 'Prelims',
            children: [
              { title: 'Test 1', link: '/upsc/prelims/test1' },
              { title: 'Test 2', link: '/upsc/prelims/test2' },
            ],
          },
          {
            title: 'Mains', link: '/upsc/mains/essay' },
        ],
      },

      {

      }
    ],
  },
  {
    title: 'About',
    link: '/about',
  },


];
