/* 英文版网站内容（由 i18n.js 在 EN 模式下替换 SITE） */
const SITE_EN = {
  "name": "999gml",
  "title": "999gml's Web Nest",
  "description": "999gml's personal homepage: about me, skills, works, posts and contact.",
  "tagline": "",
  "heroLabel": "Hi, I'm 999gml",
  "heroStatement": "Remember, with great power comes great responsibility.",
  "roles": [
    "CS undergraduate",
    "Football fan",
    "Guitarist",
    "Fire-spinner",
    "Red Devil prince",
    "Cutie"
  ],
  "sections": {
    "about": { "title": "About Me", "sub": "A CS undergraduate who loves coding and life." },
    "journey": { "title": "My Journey", "sub": "From Jiangjin Middle School to Sichuan University, always moving forward." },
    "honors": { "title": "Honors", "sub": "Some recognition along the way." },
    "skills": { "title": "Skills", "sub": "Tools and directions I keep sharpening." },
    "interests": { "title": "Interests", "sub": "Things that keep life fun." },
    "projects": { "title": "My Works", "sub": "Coding, music, video and photography." },
    "gallery": { "title": "Moments", "sub": "Everyday life captured in photos." },
    "blog": { "title": "Recent Posts", "sub": "Notes and thoughts." },
    "contact": { "title": "Contact Me", "sub": "Open to chat, collab and discussion." },
    "guestbook": { "title": "Guestbook", "sub": "Leave a message; comments powered by GitHub Discussions." }
  },
  "toolsHeading": "Tools & Languages",
  "chat": {
    "name": "小蛛",
    "greeting": "你好呀！我是小蛛🕷️ 点我聊天～",
    "apiUrl": "https://website-admin-api.vercel.app/api/chat"
  },
  "about": {
    "paragraphs": [
      "Undergrad in Computer Science and Technology (Top-Notch Program) at Sichuan University, Class of 2025; graduated from Jiangjin Middle School's 2025 direct-admission class.",
      "Loves coding and life: writing code, playing football, singing, playing guitar, and the occasional fire-spinning show."
    ],
    "stats": [
      { "num": "2025", "label": "Class · SCU Top-Notch Program" },
      { "num": "2025", "label": "Class · Direct-admission graduate" }
    ]
  },
  "skills": [
    { "name": "C / C++", "percent": 90 },
    { "name": "Python", "percent": 60 },
    { "name": "Algorithms & Data Structures", "percent": 85 },
    { "name": "Web Development", "percent": 75 }
  ],
  "tools": [
    "C / C++",
    "Python",
    "Visual Studio",
    "VS Code",
    "Git",
    "Linux",
    "HTML / CSS",
    "JavaScript",
    "Data Structures & Algorithms"
  ],
  "journey": [
    {
      "period": "2025.09 – Present",
      "title": "Sichuan University · CS & Technology (Top-Notch Program)",
      "desc": "Undergrad student, systematically studying computer science and exploring what interests me."
    },
    {
      "period": "2022.09 – 2025.06",
      "title": "Jiangjin Middle School · High School Direct-Admission Class",
      "desc": "Studied in the 2025 direct-admission class, building a solid foundation for university."
    },
    {
      "period": "2019.09 – 2022.06",
      "title": "Jiangjin Middle School · Junior High",
      "desc": "Three years of junior high, where my campus life really began."
    },
    {
      "period": "2013.09 – 2019.06",
      "title": "Caishijie Primary School",
      "desc": "Six years of primary school — where it all started."
    },
    {
      "period": "2029 · Future",
      "title": "Graduate and keep exploring",
      "desc": "Stay curious and passionate, heading to a wider world."
    }
  ],
  "honors": [
    {
      "icon": "🚀",
      "title": "First open-source release",
      "date": "2026",
      "desc": "MediaSaver media downloader open-sourced on GitHub."
    }
  ],
  "interests": [
    { "icon": "💻", "name": "Programming", "desc": "Writing code is a passion and a daily habit." },
    { "icon": "⚽", "name": "Football", "desc": "Running and teamwork on the pitch." },
    { "icon": "🎤", "name": "Singing", "desc": "Expressing feelings through songs." },
    { "icon": "🎸", "name": "Guitar", "desc": "Strumming is the most relaxing moment." },
    { "icon": "🔥", "name": "Fire-spinning", "desc": "A special skill for special occasions." }
  ],
  "gallery": [
    { "title": "雪", "img": "assets/gallery/gallery-1785856461443.jpg" },
    { "title": "格温", "img": "assets/gallery/gallery-1785859069847.jpg" },
    { "title": "格温", "img": "assets/gallery/gallery-1785937218934.jpg" },
    { "title": "川大", "img": "assets/gallery/gallery-1785937256486.jpg" }
  ],
  "workCategories": [
    "Programming",
    "Music",
    "Video",
    "Images"
  ],
  "works": [
    {
      "category": "Programming",
      "title": "MediaSaver Media Downloader",
      "desc": "A local service for downloading Douyin (video/image, no watermark) and Bilibili videos. Runs on PC, accessible from phone, and usable over the internet via intranet tunneling.",
      "tags": ["Python", "Flask", "Selenium"],
      "source": "https://github.com/ldygml/media-downloader",
      "demo": ""
    },
    {
      "category": "Programming",
      "title": "Spidey Tracker Static Mirror",
      "desc": "A static remake of the official Spider-Man promo site, replacing Google Maps with a hand-drawn map and localizing videos so it runs fully offline.",
      "tags": ["HTML", "JavaScript", "GitHub Pages"],
      "source": "https://github.com/ldygml/spidey-mirror",
      "demo": "https://ldygml.github.io/spidey-mirror/"
    },
    {
      "category": "Programming",
      "title": "QQ Anonymous Q&A Security Analysis",
      "desc": "Reverse-engineering research on the mobile anonymous Q&A mechanism — is anonymous really anonymous?",
      "tags": ["Security analysis", "Reverse engineering"],
      "source": "https://github.com/ldygml/qq-anonymous-analysis",
      "demo": "https://ldygml.github.io/qq-anonymous-analysis/"
    },
    {
      "category": "Programming",
      "title": "Flight Booking System",
      "desc": "C language course project: flight info management, booking and refunds, hash-indexed queries, interactive console UI.",
      "tags": ["C", "CMake", "Data Structures"],
      "source": "https://github.com/ldygml/flight-booking-system",
      "demo": ""
    },
    {
      "category": "Programming",
      "title": "Mouce Gets Oil",
      "desc": "A maze treasure-hunt mini game built with C++ / EasyX: 3 levels, chasing enemies, teleporters and frozen traps, with save/load support.",
      "tags": ["C++", "EasyX", "Game dev"],
      "source": "https://github.com/ldygml/mouce-gets-oil",
      "demo": ""
    },
    {
      "category": "Music",
      "title": "My First Cover",
      "desc": "My very first cover song.",
      "tags": ["Cover"],
      "source": "",
      "demo": "assets/works/work-1785937110097.ogg"
    },
    {
      "category": "Video",
      "title": "Spider-Man Easter Egg",
      "desc": "I'm the little spider.",
      "tags": ["Vlog"],
      "source": "",
      "demo": "assets/works/work-1785857761609.mp4"
    },
    {
      "category": "Images",
      "title": "Chongqing Special B",
      "desc": "Shot during a Chongqing trip.",
      "tags": ["Photography"],
      "source": "",
      "demo": "assets/works/work-1785857718814.jpg"
    }
  ],
  "posts": [
    {
      "title": "Thoughts Triggered by a Matrix Rotation",
      "date": "2026-08-05",
      "category": "Study Notes",
      "excerpt": "From one square-matrix rotation problem, through coordinates and polar coordinates to linear algebra — the first time I truly felt the connection between math and programming.",
      "link": "",
      "content": "## Origin\n\nA simple square-matrix rotation problem left me stuck — where did the index transform come from?\n\n## Coordinates & Slopes\n\nSetting up coordinates brought back high-school knowledge; distance invariance and slope products finally clicked.\n\n## Polar Coordinates\n\nPolar coordinates solved it faster and fixed the single-angle issue.\n\n## Linear Algebra\n\nBringing in linear algebra, one formula solved the whole transform.\n\nA small problem, but it opened my eyes to how math and programming connect."
    },
    {
      "title": "Retrospective on My First Open-Source Project",
      "date": "2026-07-20",
      "category": "Tech Sharing",
      "excerpt": "From idea to release: the pitfalls, takeaways, and growth from community feedback.",
      "link": "",
      "content": "## Why This Project\n\nAfter learning programming in freshman year, I always wanted to turn my code into something shareable.\n\n## Pitfalls\n\n- Forgot edge cases in the first release\n- Docs always matter more than code\n- Clear naming, disciplined comments\n\n## Takeaways\n\nCommunity feedback is the best motivation. Keep shipping, keep growing."
    },
    {
      "title": "Some Thoughts on Productivity Tools",
      "date": "2026-06-11",
      "category": "Life Notes",
      "excerpt": "More tools aren't better — what matters is building a workflow of your own.",
      "link": "",
      "content": "## Are More Tools Better?\n\nI used to try every productivity tool; the real difference maker is habit, not tools.\n\n## My Principles\n\n1. One tool for one type of problem\n2. Stick with it for a month before deciding\n3. Simple > powerful\n\n> The best tool is the one you keep using."
    },
    {
      "title": "Whitespace and Breathing Room in Minimal Design",
      "date": "2026-05-02",
      "category": "Design Notes",
      "excerpt": "Whitespace isn't wasted space — it gives content room to be seen and understood.",
      "link": "",
      "content": "## What Is Whitespace\n\nWhitespace isn't blankness; it gives elements breathing room.\n\n## Three Roles of Whitespace\n\n- Guide the eye\n- Lower cognitive load\n- Make content feel more premium\n\nDesign is subtraction — often harder than addition."
    }
  ],
  "contact": {
    "emails": [
      { "label": "QQ Mail", "address": "1172134688@qq.com" },
      { "label": "Gmail", "address": "baonamne74@gmail.com" }
    ],
    "github": { "handle": "ldygml", "url": "https://github.com/ldygml" },
    "wechat": "",
    "socials": [
      {
        "label": "Douyin",
        "handle": "20889436206",
        "url": "https://www.douyin.com/user/MS4wLjABAAAAMA1Wf7pbNsLlTiY3b899_raXqj0S2tQpqnQIX0JJ7fk",
        "icon": "douyin"
      },
      {
        "label": "Xiaohongshu",
        "handle": "95568700912",
        "url": "https://www.xiaohongshu.com/user/profile/6868c70e000000001d00b04e?xsec_token=YBUsqy6dhbYv0KcmdGugJq-QzdDB8ICE1jTBfFgkumEW4%3D&xsec_source=app_share",
        "icon": "xiaohongshu"
      }
    ]
  }
};
