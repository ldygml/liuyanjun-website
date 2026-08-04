/* ============================================================
   网站内容配置文件
   ------------------------------------------------------------
   【怎么用】
   想改网站上的任何文字，只需要打开这个文件、修改保存，
   然后刷新页面即可。不需要懂代码。

   注意三点：
   1. 文字两边的引号不要删（英文双引号 " 或中文引号都可以）；
   2. 每条信息之间用英文逗号 , 分隔；
   3. 暂时没有的内容留空字符串 '' 即可。
   ============================================================ */

const SITE = {

  /* ---------- 基本信息 ---------- */
  name: '刘彦君',                                  // 你的名字（导航栏、大标题、页脚）
  title: '刘彦君 · 个人主页',                       // 浏览器标签页显示的标题
  description: '刘彦君的个人主页：关于我、技能、作品、文章与联系方式。',
  tagline: '',                                      // 首页大标题下方的一句话（留空则隐藏）
  heroLabel: '你好，我是 刘彦君',                    // 首页顶部的小字
  heroStatement: 'Remember, with great power comes great responsibility.',  // 首页大标题

  /* 首页打字机循环显示的标签（会一个接一个打字出现） */
  roles: ['计算机科学本科生', '足球爱好者', '吉他手', '喷火爱好者'],

  /* ---------- 各区块的标题 ---------- */
  sections: {
    about:     { title: '关于我', sub: '一个热爱编程与生活的计算机科学本科生。' },
    journey:   { title: '我的经历', sub: '从江津中学到四川大学，一路向前。' },
    skills:    { title: '技能', sub: '正在持续夯实的工具与方向。' },
    interests: { title: '兴趣爱好', sub: '让生活保持有趣的一些事。' },
    projects:  { title: '个人作品', sub: '编程、音乐、视频与影像作品。' },
    gallery:   { title: '生活瞬间', sub: '用照片记录日常。' },
    blog:      { title: '最近文章', sub: '一些记录与思考。' },
    contact:   { title: '联系我', sub: '欢迎交流、合作与讨论。' },
    guestbook: { title: '留言板', sub: '欢迎留言交流，评论由 GitHub Discussions 提供支持。' }
  },
  toolsHeading: '常用工具与语言',

  /* ---------- 关于我 ---------- */
  about: {
    /* 个人介绍：一段话一个字符串，可以随意增删 */
    paragraphs: [
      '四川大学 25 级计算机科学与技术（拔尖计划）在读本科生，毕业于江津中学 25 届直升班。',
      '热爱编程与生活：写代码、踢足球、唱歌、弹吉他，偶尔还会来点喷火表演。'
    ],
    /* 三个统计数字：num 是大数字，label 是下面的说明文字 */
    stats: [
      { num: '2025', label: '级 川大拔尖计划' },
      { num: '2025', label: '届 直升班毕业' }
    ]
  },

  /* ---------- 技能（percent 填 0-100 的数字） ---------- */
  skills: [
    { name: 'C / C++', percent: 85 },
    { name: 'Python', percent: 80 },
    { name: '算法与数据结构', percent: 75 },
    { name: 'Web 开发', percent: 65 }
  ],

  /* 常用工具与语言标签 */
  tools: ['C / C++', 'Python', 'Visual Studio', 'VS Code', 'Git', 'Linux', 'HTML / CSS', 'JavaScript', '数据结构与算法'],

  /* ---------- 我的经历（时间线） ---------- */
  journey: [
    { period: '2025.09 — 至今', title: '四川大学 · 计算机科学与技术（拔尖计划）', desc: '本科在读，正在系统学习计算机科学，探索感兴趣的方向。' },
    { period: '2022.09 — 2025.06', title: '江津中学 · 高中直升班', desc: '25 届直升班学习，为大学打下了扎实的基础。' },
    { period: '2019.09 — 2022.06', title: '江津中学 · 初中', desc: '初中三年，在这里开始了充实的校园生活。' },
    { period: '2013.09 — 2019.06', title: '菜市街小学', desc: '六年的小学时光，最初的成长起点。' },
    { period: '2029 · 未来', title: '本科毕业，继续探索', desc: '保持好奇与热爱，走向更广阔的天地。' }
  ],

  /* ---------- 兴趣爱好 ---------- */
  interests: [
    { icon: '💻', name: '编程', desc: '写代码是热爱，也是日常' },
    { icon: '⚽', name: '足球', desc: '球场上的奔跑与配合' },
    { icon: '🎤', name: '唱歌', desc: '用歌声表达情绪' },
    { icon: '🎸', name: '吉他', desc: '弹唱是最放松的时刻' },
    { icon: '🔥', name: '喷火', desc: '偶尔来点特别的才艺' }
  ],

  /* ---------- 生活瞬间（相册） ----------
     把照片放进 assets/gallery/ 目录，再把路径填到 img，
     例如 'assets/gallery/01.jpg'；img 留空则显示占位图块。 */
  gallery: [
    { title: '生活瞬间', img: '' },
    { title: '生活瞬间', img: '' },
    { title: '生活瞬间', img: '' },
    { title: '生活瞬间', img: '' }
  ],

  /* ---------- 作品分类（顶部标签栏） ---------- */
  workCategories: ['编程', '音乐', '视频', '图片'],

  /* ---------- 个人作品 ----------
     category 填上面分类之一；
     source / demo 是链接，没有就留 ''。
     编程作品会显示“查看源码 / 在线预览”，
     其他类别显示“查看作品”。 */
  works: [
    {
      category: '编程',
      title: 'MediaSaver 媒体下载工具',
      desc: '支持抖音（视频/图片无水印）和 B 站视频下载的本地服务，电脑运行、手机访问，还能通过内网穿透在外网使用。',
      tags: ['Python', 'Flask', 'Selenium'],
      source: 'https://github.com/ldygml/media-downloader',
      demo: ''
    },
    {
      category: '编程',
      title: 'Spidey Tracker 静态镜像站',
      desc: '将《蜘蛛侠》官方宣传站静态化改造，用自绘地图替换 Google Maps、视频本地化，可完全离线运行。',
      tags: ['HTML', 'JavaScript', 'GitHub Pages'],
      source: 'https://github.com/ldygml/spidey-mirror',
      demo: 'https://ldygml.github.io/spidey-mirror/'
    },
    {
      category: '编程',
      title: 'QQ 匿名问答安全性分析',
      desc: '对移动端匿名问答机制的逆向安全调研——匿名问答真的匿名吗？',
      tags: ['安全分析', '逆向调研'],
      source: 'https://github.com/ldygml/qq-anonymous-analysis',
      demo: 'https://ldygml.github.io/qq-anonymous-analysis/'
    },
    {
      category: '编程',
      title: '航班订票管理系统',
      desc: 'C 语言课程项目：航班信息管理、订票与退票，哈希表索引加速查询，交互式控制台界面。',
      tags: ['C', 'CMake', '数据结构'],
      source: 'https://github.com/ldygml/flight-booking-system',
      demo: ''
    },
    {
      category: '编程',
      title: 'Mouce Gets Oil（老鼠偷油）',
      desc: 'C++ / EasyX 图形库迷宫寻宝小游戏：4 个关卡、敌人追击、传送与冰冻陷阱，支持存档读档。',
      tags: ['C++', 'EasyX', '游戏开发'],
      source: 'https://github.com/ldygml/mouce-gets-oil',
      demo: ''
    },
    {
      category: '音乐',
      title: '我的第一首翻唱（占位）',
      desc: '等你上传音乐作品后，在这里放上链接（网易云 / 抖音 / B 站均可）。',
      tags: ['翻唱'],
      source: '',
      demo: ''
    },
    {
      category: '视频',
      title: '校园生活 Vlog（占位）',
      desc: '等你上传视频作品后，在这里放上链接（B 站 / 抖音均可）。',
      tags: ['Vlog'],
      source: '',
      demo: ''
    },
    {
      category: '图片',
      title: '摄影练习（占位）',
      desc: '等你整理好摄影作品后，在这里放上链接或图片。',
      tags: ['摄影'],
      source: '',
      demo: ''
    }
  ],

  /* ---------- 文章 ----------（date 用 年-月-日 格式，link 没有就留 ''） */
  posts: [
    { title: '我的第一个开源项目的复盘', date: '2026-07-20', category: '技术分享', excerpt: '从想法到发布，分享过程中的踩坑、收获以及社区反馈带来的成长。', link: '' },
    { title: '关于效率工具的一点思考', date: '2026-06-11', category: '生活随笔', excerpt: '工具不是越多越好，真正重要的是建立属于自己的工作流。', link: '' },
    { title: '极简设计中的留白与呼吸感', date: '2026-05-02', category: '设计笔记', excerpt: '留白不是浪费空间，而是给内容留出被看见和被理解的机会。', link: '' }
  ],

  /* ---------- 联系方式 ----------
     邮箱可以加多个：在 emails 数组里复制一行、改一下即可；
     没有的项目留空字符串 ''，对应的卡片会自动隐藏。 */
  contact: {
    emails: [
      { label: 'QQ 邮箱', address: '1172134688@qq.com' },
      { label: 'Gmail', address: 'baonamne74@gmail.com' }
    ],
    github: {
      handle: 'ldygml',
      url: 'https://github.com/ldygml'
    },
    wechat: '',  // 微信号，留空则隐藏该卡片
    /* 其他社交账号：复制一行、填上 url 即可显示；url 留空则隐藏 */
    socials: [
      { label: '抖音', handle: '20889436206', url: 'https://www.douyin.com/user/MS4wLjABAAAAMA1Wf7pbNsLlTiY3b899_raXqj0S2tQpqnQIX0JJ7fk', icon: 'douyin' },
      { label: '小红书', handle: '95568700912', url: 'https://www.xiaohongshu.com/user/profile/6868c70e000000001d00b04e?xsec_token=YBUsqy6dhbYv0KcmdGugJq-QzdDB8ICE1jTBfFgkumEW4%3D&xsec_source=app_share', icon: 'xiaohongshu' }
    ]
  }
};
