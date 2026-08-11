import os
import re
import yaml

SCIENTISTS_DIR = r"E:\1\Biology_Starry_Vault\01_Scientists"

DATA = {
    "丹尼利和戴维森": {
        "nationality": "英国",
        "era": "20世纪30年代（1935年）",
        "quick_recall": "提出细胞膜的“蛋白质-脂质-蛋白质”三明治静态结构模型。",
        "common_trap": "误以为三明治模型能够解释细胞膜的流动性或胞吞胞吐。",
        "focus": ["三明治静态模型", "静态结构模型的局限性"],
        "core_method": ["[[显微观察法]]", "[[推理解析法]]"],
        "cognitive_type": "结构解析/假说推演",
        "knowledge_module": "细胞的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "克劳德": {
        "nationality": "比利时/美国",
        "era": "20世纪40-50年代",
        "quick_recall": "发展差速离心技术，成功分离并观察线粒体、叶绿体等细胞器。",
        "common_trap": "误以为他发明了电子显微镜，实际上他是将差速离心与电镜观察结合。",
        "focus": ["细胞器的分离方法（差速离心法）", "线粒体与内质网的结构观察"],
        "core_method": ["[[差速离心法]]", "[[电子显微镜观察法]]"],
        "cognitive_type": "实验实证/技术开发",
        "knowledge_module": "细胞的结构与功能",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "内格里": {
        "nationality": "瑞士",
        "era": "19世纪中叶",
        "quick_recall": "与孟德尔频繁通信的权威植物学家，因墨守成规忽视了孟德尔定律。",
        "common_trap": "误以为他支持孟德尔的杂交定律，实际上他极力推荐孟德尔去研究不适合的山柳菊。",
        "focus": ["遗传学史上的科学争论", "山柳菊杂交实验的局限"],
        "core_method": ["[[观察实验法]]"],
        "cognitive_type": "经验归纳/传统范式",
        "knowledge_module": "遗传学发展史",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "切尔马克": {
        "nationality": "奥地利",
        "era": "19世纪末20世纪初（1900年）",
        "quick_recall": "1900年独立重新发现孟德尔遗传规律的三大科学家之一。",
        "common_trap": "误以为他是发现分离定律的第一人，实际上他是通过独立杂交实验重新验证了它。",
        "focus": ["孟德尔定律的重新发现", "杂交实验验证"],
        "core_method": ["[[杂交实验法]]", "[[统计分析法]]"],
        "cognitive_type": "实验验证/归纳总结",
        "knowledge_module": "遗传规律",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "切赫": {
        "nationality": "美国",
        "era": "20世纪80年代",
        "quick_recall": "发现某些RNA具有催化功能，打破了“酶都是蛋白质”的传统观念。",
        "common_trap": "误以为所有的酶都是RNA，或误以为酶的本质只有RNA。",
        "focus": ["核酶的发现", "酶本质概念的完善"],
        "core_method": ["[[生化分析法]]", "[[体外转录与催化法]]"],
        "cognitive_type": "实验实证/颠覆认知",
        "knowledge_module": "酶的本质与功能",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "列文虎克": {
        "nationality": "荷兰",
        "era": "17世纪中叶（1632-1723年）",
        "quick_recall": "显微镜下的“第一人”，用自制镜片首次看清了细菌和活细胞。",
        "common_trap": "误以为他命名了细胞，实际上他称之为“微小动物”，命名细胞的是罗伯特·胡克。",
        "focus": ["活细胞的首次观察", "显微镜的发展与使用"],
        "core_method": ["[[显微观察法]]"],
        "cognitive_type": "直觉观察/归纳发现",
        "knowledge_module": "细胞学说与显微观察",
        "gaokao_dimension": ["基础性"]
    },
    "华莱士": {
        "nationality": "英国",
        "era": "19世纪中叶（1858年）",
        "quick_recall": "独立提出以自然选择为基础的进化论，与达尔文共同发表论文。",
        "common_trap": "误以为他与达尔文是竞争敌对关系，实际上两人保持着高尚的学术绅士风度。",
        "focus": ["自然选择学说的独立发现", "物种起源假说"],
        "core_method": ["[[野外考察法]]", "[[比较解剖学法]]"],
        "cognitive_type": "经验归纳/假说推演",
        "knowledge_module": "生物进化",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "博耶": {
        "nationality": "美国",
        "era": "20世纪70年代",
        "quick_recall": "与科恩合作完成基因工程的首次重组DNA实验，开创基因工程时代。",
        "common_trap": "误以为他独立完成了基因工程的全部工作，其实是博耶精通限制酶，科恩精通质粒。",
        "focus": ["限制性核酸内切酶的应用", "重组DNA分子的构建"],
        "core_method": ["[[重组DNA技术]]", "[[酶切与连接法]]"],
        "cognitive_type": "技术集成/跨界工程",
        "knowledge_module": "基因工程",
        "gaokao_dimension": ["综合性", "应用性"]
    },
    "卢里亚": {
        "nationality": "意大利/美国",
        "era": "20世纪中叶（1912-1991年）",
        "quick_recall": "细菌遗传学拓荒者，波动测试实验证明细菌突变是随机发生的。",
        "common_trap": "误以为突变是由环境（如噬菌体）定向诱导产生的，其实突变是随机、不定向的。",
        "focus": ["细菌突变的选择学说", "波动测试实验设计"],
        "core_method": ["[[波动测试实验]]", "[[统计检验法]]"],
        "cognitive_type": "实验实证/逻辑推演",
        "knowledge_module": "基因突变与基因重组",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "哈伯兰特": {
        "nationality": "奥地利",
        "era": "20世纪初（1902年）",
        "quick_recall": "首次提出植物细胞全能性假说，被誉为植物组织培养之父。",
        "common_trap": "误以为他成功培养出了植物植株，其实因为缺乏植物激素，他的实验均以失败告终。",
        "focus": ["细胞全能性假说的提出", "植物细胞培养概念"],
        "core_method": ["[[理论推演法]]"],
        "cognitive_type": "假说直觉/理论奠基",
        "knowledge_module": "植物细胞工程",
        "gaokao_dimension": ["基础性", "创新性"]
    },
    "坎农": {
        "nationality": "美国",
        "era": "20世纪初（1871-1945年）",
        "quick_recall": "稳态学说的命名者，阐明了身体在应急状态下的调节机制。",
        "common_trap": "误以为他发现了内环境的概念，内环境由贝尔纳提出，坎农命名了“稳态”。",
        "focus": ["稳态概念的界定与发展", "交感-肾上腺素系统的应急调节机制"],
        "core_method": ["[[动物实验生理学]]", "[[系统分析法]]"],
        "cognitive_type": "系统思维/理论建构",
        "knowledge_module": "内环境与稳态",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "坦斯利": {
        "nationality": "英国",
        "era": "20世纪30年代（1935年）",
        "quick_recall": "生态系统（ecosystem）概念的首次提出者。",
        "common_trap": "误以为生态系统是由群落和无机环境物理混合，其实是生态系统的能量和物质流相互交织的统一体。",
        "focus": ["生态系统概念的提出", "生物与环境的统一性"],
        "core_method": ["[[系统分析法]]", "[[概念建模法]]"],
        "cognitive_type": "系统思维/概念建构",
        "knowledge_module": "生态系统",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "奥德姆": {
        "nationality": "美国",
        "era": "20世纪中叶",
        "quick_recall": "现代生态学之父，构建了以生态系统为核心的生态学理论框架。",
        "common_trap": "误以为生态学只关注环境保护，其实生态学是研究生物与环境系统性互动的学科。",
        "focus": ["生态学系统方法", "能流与物循的理论整合"],
        "core_method": ["[[系统动力学建模]]", "[[定量生态分析法]]"],
        "cognitive_type": "系统思维/跨界整合",
        "knowledge_module": "生态系统",
        "gaokao_dimension": ["综合性", "应用性"]
    },
    "奥特曼": {
        "nationality": "加拿大/美国",
        "era": "20世纪70-80年代（1939-2022年）",
        "quick_recall": "与切赫共同发现RNA具有催化功能，打破了酶都是蛋白质的传统认知。",
        "common_trap": "误以为他参与了DNA双螺旋的构建，其实他的贡献是在RNA的催化活性发现上。",
        "focus": ["核酶的发现", "酶本质概念的完善"],
        "core_method": ["[[核酸生物化学分析]]", "[[层析与电泳法]]"],
        "cognitive_type": "实验实证/结构解析",
        "knowledge_module": "酶的本质与功能",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "威尔穆特": {
        "nationality": "英国",
        "era": "20世纪90年代（1996年）",
        "quick_recall": "成功培育出克隆羊多莉，证明了动物体细胞核具有全能性。",
        "common_trap": "误以为多莉羊的遗传物质完全来自于提供乳腺细胞核的母羊，其实其细胞质DNA来自去核卵母细胞的母羊。",
        "focus": ["动物体细胞核移植技术", "动物细胞核的全能性"],
        "core_method": ["[[核移植技术]]", "[[胚胎移植技术]]"],
        "cognitive_type": "技术整合/工程实践",
        "knowledge_module": "细胞工程",
        "gaokao_dimension": ["综合性", "应用性"]
    },
    "威尔金斯": {
        "nationality": "英国/新西兰",
        "era": "20世纪50年代",
        "quick_recall": "用X射线衍射技术研究DNA晶体结构，为双螺旋模型的建立奠定了物理基础。",
        "common_trap": "误以为他只在旁边打下手，其实他是DNA晶体衍射研究的独立开拓者。",
        "focus": ["DNA衍射图谱分析", "DNA物理结构解析"],
        "core_method": ["[[X射线衍射分析法]]"],
        "cognitive_type": "结构解析/实验实证",
        "knowledge_module": "DNA的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "富兰克林": {
        "nationality": "英国",
        "era": "20世纪50年代",
        "quick_recall": "拍摄了最关键的DNA晶体衍射“照片51号”，为双螺旋的确立提供了决定性物理事实。",
        "common_trap": "误以为她是沃森和克里克的助手，其实她是杰出的女物理化学家，对衍射数据的定量分析极其精密。",
        "focus": ["照片51号在DNA结构构建中的作用", "X射线晶体学方法"],
        "core_method": ["[[X射线衍射分析法]]"],
        "cognitive_type": "结构解析/精密实验",
        "knowledge_module": "DNA的结构",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "尼伦伯格和马太": {
        "nationality": "美国",
        "era": "20世纪60年代（1961年）",
        "quick_recall": "用人工合成的Poly-U及体外翻译系统成功破译了第一个遗传密码子UUU。",
        "common_trap": "误以为他们是在活细胞内破译遗传密码，其实是构建了无细胞的蛋白质体外合成系统。",
        "focus": ["遗传密码的破译方法", "无细胞合成系统与密码子对照"],
        "core_method": ["[[体外翻译实验法]]", "[[同位素示踪技术]]"],
        "cognitive_type": "实验实证/逻辑推演",
        "knowledge_module": "基因的表达",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "巴甫洛夫": {
        "nationality": "俄国",
        "era": "19世纪末至20世纪初",
        "quick_recall": "发现条件反射，建立了高级神经活动生理学体系。",
        "common_trap": "误以为条件反射是一旦建立就永久不灭的，其实条件反射如果得不到非条件刺激强化，会逐渐消退。",
        "focus": ["条件反射与非条件反射的比较", "条件反射的建立与消退机制"],
        "core_method": ["[[慢性实验法]]", "[[生理反射测量法]]"],
        "cognitive_type": "行为分析/实验实证",
        "knowledge_module": "神经调节",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "希尔": {
        "nationality": "英国",
        "era": "20世纪30年代（1937年）",
        "quick_recall": "离体叶绿体光照释氧反应（希尔反应）的发现者，证实水的光解与碳同化独立发生。",
        "common_trap": "误以为希尔反应中能合成糖类分子，其实它只进行了水的光解并释放氧气。",
        "focus": ["希尔反应的实验设计", "光反应与暗反应的独立性"],
        "core_method": ["[[体外叶绿体悬浮实验]]", "[[氧化还原指示剂法]]"],
        "cognitive_type": "实验实证/化学分析",
        "knowledge_module": "细胞代谢（光合作用）",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "康拉特": {
        "nationality": "德国/美国",
        "era": "20世纪50年代（1956年）",
        "quick_recall": "通过烟草花叶病毒（TMV）重建实验，证明RNA是TMV的遗传物质。",
        "common_trap": "误以为他证明了所有的非细胞生物的遗传物质都是RNA，其实仅证明了RNA病毒以RNA为遗传物质。",
        "focus": ["病毒重组实验设计", "RNA是遗传物质的实验证据"],
        "core_method": ["[[病毒重组与感染实验]]", "[[对照分析法]]"],
        "cognitive_type": "结构解析/假说实证",
        "knowledge_module": "遗传物质的探究",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "弗莱明": {
        "nationality": "英国",
        "era": "20世纪初",
        "quick_recall": "偶然发现青霉菌能产生抑菌物质青霉素，开启抗生素新纪元。",
        "common_trap": "误以为是他发明了抗生素的工业化提纯，他只发现了现象，提纯由弗洛里和钱恩完成。",
        "focus": ["青霉素的发现", "微生物间的拮抗与竞争关系"],
        "core_method": ["[[平板划线观察法]]"],
        "cognitive_type": "直觉观察/巧合转化",
        "knowledge_module": "微生物与人类健康",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "弗雷和埃迪登": {
        "nationality": "美国",
        "era": "1970年",
        "quick_recall": "用红绿荧光标记人鼠细胞融合实验，直观证明了细胞膜的流动性。",
        "common_trap": "误以为该实验是通过磷脂分子的运动证明流动性，其实是通过荧光标记的蛋白质运动证明的。",
        "focus": ["人鼠细胞融合实验设计", "细胞膜结构的流动性"],
        "core_method": ["[[荧光标记法]]", "[[细胞融合技术]]"],
        "cognitive_type": "实验实证/图像可视化",
        "knowledge_module": "细胞膜的流动镶嵌模型",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "德尔布吕克": {
        "nationality": "德国/美国",
        "era": "20世纪中叶（1906-1981年）",
        "quick_recall": "物理学家跨界推动分子生物学，倡导噬菌体小组的定量分析研究。",
        "common_trap": "误以为他亲手做出了DNA双螺旋，他主要是在方法论上指引了噬菌体与分子生物学小组。",
        "focus": ["噬菌体小组的科学贡献", "物理学对生物学发展的推动"],
        "core_method": ["[[定量计算与模型法]]", "[[噬菌体侵染法]]"],
        "cognitive_type": "跨界整合/数学定量",
        "knowledge_module": "分子生物学史",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "德弗里斯": {
        "nationality": "荷兰",
        "era": "19世纪末20世纪初",
        "quick_recall": "孟德尔遗传规律的“三大复活者”之首，提出进化突变论。",
        "common_trap": "误以为他观察到的是基因点突变，其实主要是大月见草的染色体变异及多倍体化。",
        "focus": ["孟德尔定律的重新发现", "突变学说的提出"],
        "core_method": ["[[观察杂交实验]]", "[[变异归纳法]]"],
        "cognitive_type": "理论推演/现象归纳",
        "knowledge_module": "遗传与进化",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "恩格尔曼": {
        "nationality": "德国",
        "era": "19世纪中叶",
        "quick_recall": "用水绵和好氧细菌实验精确证明叶绿体是光合作用场所，且红光蓝紫光最高效。",
        "common_trap": "误以为好氧细菌是释放氧气的，其实好氧细菌是用作氧气分布的活体示踪器。",
        "focus": ["水绵与好氧细菌实验设计", "光合作用的光谱选择与场所"],
        "core_method": ["[[极细光束微照法]]", "[[好氧细菌示踪法]]", "[[显微观察法]]"],
        "cognitive_type": "实验实证/对照控制",
        "knowledge_module": "细胞代谢（光合作用）",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "戈特和格伦德尔": {
        "nationality": "荷兰",
        "era": "1925年",
        "quick_recall": "提取红细胞脂质，测得单分子层面积为红细胞表面积两倍，证明细胞膜由脂双层构成。",
        "common_trap": "误以为他们用的是红细胞核，哺乳动物成熟红细胞没有核及复杂的细胞器，排除了内膜系统的干扰。",
        "focus": ["红细胞单分子层面积测量", "脂双层模型的建立"],
        "core_method": ["[[红细胞脂质提取法]]", "[[单分子层面积测量法]]"],
        "cognitive_type": "结构解析/定量计算",
        "knowledge_module": "细胞膜的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "拉马克": {
        "nationality": "法国",
        "era": "18世纪末19世纪初（1744-1829年）",
        "quick_recall": "首次系统提出进化论，倡导“用进废退” and “获得性遗传”。",
        "common_trap": "误以为拉马克的进化假说对现代科学毫无贡献，其实他是把进化引入科学的伟大先驱。",
        "focus": ["用进废退与获得性遗传内容", "在进化论史上的先驱地位"],
        "core_method": ["[[比较解剖学法]]", "[[演化假说推演]]"],
        "cognitive_type": "假说直觉/现象归纳",
        "knowledge_module": "生物进化",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "拜尔": {
        "nationality": "匈牙利",
        "era": "1914-1918年",
        "quick_recall": "胚芽鞘尖端错位放置实验证明尖端产生的影响分布不均导致弯曲生长。",
        "common_trap": "误以为该实验必须在光下，其实该实验必须在黑暗中进行以排除单侧光的干扰。",
        "focus": ["胚芽鞘尖端不均匀放置实验", "向光弯曲生长的机理"],
        "core_method": ["[[切除与错位放置实验]]", "[[避光单因素对照]]"],
        "cognitive_type": "实验实证/逻辑推理",
        "knowledge_module": "植物生长素的发现",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "摩尔根": {
        "nationality": "美国",
        "era": "20世纪初（1908-1920年代）",
        "quick_recall": "用果蝇杂交实验证明了基因在染色体上，发现伴性遗传规律。",
        "common_trap": "混淆萨顿的“类比推理”（未加证明）与摩尔根的“假说-演绎”（用杂交实验进行确证）。",
        "focus": ["果蝇杂交实验", "伴性遗传规律", "基因连锁互换"],
        "core_method": ["[[假说-演绎法]]", "[[显微观察法]]"],
        "cognitive_type": "实验实证/逻辑推演",
        "knowledge_module": "遗传规律（伴性遗传）",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "斯图尔特": {
        "nationality": "英国/美国",
        "era": "20世纪50年代（1904-1993年）",
        "quick_recall": "培养胡萝卜韧皮部单细胞发育成完整植株，首次实证植物细胞全能性。",
        "common_trap": "误以为用成熟分化的细胞直接发芽，其必须通过脱分化形成愈伤组织，再分化发育成植株。",
        "focus": ["胡萝卜组织单细胞培养", "植物细胞全能性的实证与过程"],
        "core_method": ["[[植物组织培养技术]]", "[[植物激素配比调节]]"],
        "cognitive_type": "实验实证/细胞工程",
        "knowledge_module": "植物细胞工程",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "斯帕兰扎尼": {
        "nationality": "意大利",
        "era": "18世纪（1729-1799年）",
        "quick_recall": "用小金属笼喂鹰实验证明胃液具有化学性消化作用。",
        "common_trap": "误以为他纯化并提取了消化酶，他只是证明了胃部消化不全是胃壁的物理磨碎。",
        "focus": ["胃部化学性消化的设计", "排除胃壁磨碎的实验控制"],
        "core_method": ["[[金属小笼动物吞食实验]]"],
        "cognitive_type": "实验实证/直觉推演",
        "knowledge_module": "酶的发现史",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "施旺": {
        "nationality": "德国",
        "era": "19世纪中叶（1810-1882年）",
        "quick_recall": "细胞学说的共同创始人，确立了一切动物体也是由细胞构成的理念。",
        "common_trap": "误以为他独自创立了细胞学说，实际上是与施莱登分别在植物与动物领域的研究共同构筑的。",
        "focus": ["动物组织细胞普查", "细胞学说的基本内容"],
        "core_method": ["[[显微镜检法]]", "[[解剖学比较法]]"],
        "cognitive_type": "跨界整合/归纳总结",
        "knowledge_module": "细胞学说的建立",
        "gaokao_dimension": ["基础性"]
    },
    "施莱登": {
        "nationality": "德国",
        "era": "19世纪中叶（1804-1881年）",
        "quick_recall": "细胞学说的共同创始人，确立了植物都是由细胞构成的观点。",
        "common_trap": "误以为他正确解释了新细胞产生的机制，他错误地以为新细胞是通过细胞核结晶而来的。",
        "focus": ["植物细胞形态分类", "细胞学说的基本内容"],
        "core_method": ["[[显微观察法]]", "[[解剖归纳法]]"],
        "cognitive_type": "直觉归纳/理论建构",
        "knowledge_module": "细胞学说的建立",
        "gaokao_dimension": ["基础性"]
    },
    "林德曼": {
        "nationality": "美国",
        "era": "20世纪40年代（1942年）",
        "quick_recall": "定量分析湖泊生态系统能流，提出能量流动逐级递减规律（10%-20%）。",
        "common_trap": "误以为能量传递效率是营养级内个体的同化量之比，其实是营养级之间的同化量之比。",
        "focus": ["生态系统的能量流动定量分析", "能量传递效率的计算与意义"],
        "core_method": ["[[生态能流定量分析法]]", "[[生态系统能量流动数学建模]]"],
        "cognitive_type": "数据建模/定量分析",
        "knowledge_module": "生态系统的能量流动",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "查哥夫": {
        "nationality": "奥地利/美国",
        "era": "20世纪中叶（1905-2002年）",
        "quick_recall": "测定多种生物碱基比例得出A=T，G=C的查哥夫法则，为双螺旋提供化学约束。",
        "common_trap": "误以为他知道了碱基氢键配对，他只提出了碱基比例相等的事实，空间配对由沃森克里克构建。",
        "focus": ["查哥夫法则的主要内容", "碱基配对机制的确定依据"],
        "core_method": ["[[纸层析定量分析法]]", "[[紫外吸收光谱法]]"],
        "cognitive_type": "实验实证/定量分析",
        "knowledge_module": "DNA的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "格里菲思": {
        "nationality": "英国",
        "era": "1928年",
        "quick_recall": "肺炎链球菌体内转化实验发现了让R型转化为S型活菌的“转化因子”。",
        "common_trap": "误以为格里菲思实验得出了DNA是遗传物质的结论，其仅推断存在“转化因子”。",
        "focus": ["体内转化实验四组对照的设计", "“转化因子”假说的得出"],
        "core_method": ["[[小鼠体内注射实验]]"],
        "cognitive_type": "实验实证/假说提出",
        "knowledge_module": "遗传物质的探究",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "桑格": {
        "nationality": "英国",
        "era": "20世纪中叶（1918-2013年）",
        "quick_recall": "发明双脱氧核苷酸链终止测序法，首测牛胰岛素及DNA序列，两获诺贝尔奖。",
        "common_trap": "误以为Sanger测序法需要用到RNA聚合酶，其利用的是DNA聚合酶以及终止用ddNTP。",
        "focus": ["Sanger双脱氧链终止法原理", "DNA测序在基因工程中应用"],
        "core_method": ["[[双脱氧核苷酸链终止测序法]]"],
        "cognitive_type": "技术开发/结构解析",
        "knowledge_module": "生物技术与工程",
        "gaokao_dimension": ["综合性", "应用性"]
    },
    "梅塞尔森和斯塔尔": {
        "nationality": "美国",
        "era": "20世纪50年代（1958年）",
        "quick_recall": "用重氮同位素与密度梯度离心实验，证实了DNA半保留复制机制。",
        "common_trap": "误以为15N有放射性，其为稳定同位素，必须通过离心后DNA带的物理密度差来分离检测。",
        "focus": ["同位素标记DNA半保留复制实验", "密度梯度离心分离带的物理意义"],
        "core_method": ["[[同位素标记法]]", "[[密度梯度离心法]]"],
        "cognitive_type": "实验实证/逻辑推演",
        "knowledge_module": "DNA的复制",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "欧文顿": {
        "nationality": "英国",
        "era": "19世纪末（1895-1899年）",
        "quick_recall": "根据脂溶性物质更易跨膜透性实验，得出细胞膜是由脂质组成的化学推论。",
        "common_trap": "误以为他使用显微注射直接提取了细胞膜，他是根据跨膜透性规律作出的间接化学推理。",
        "focus": ["物质跨膜透性对照实验", "细胞膜主要成分（脂质）的推导"],
        "core_method": ["[[跨膜透性对比法]]"],
        "cognitive_type": "逻辑推演/假说假定",
        "knowledge_module": "细胞膜的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "比夏": {
        "nationality": "法国",
        "era": "18世纪末",
        "quick_recall": "解剖中指出器官由组织构成，为细胞学说的创立奠定宏观组织学基础。",
        "common_trap": "误以为他在微观下看到了细胞结构，其实他仅在解剖学中对宏观组织进行了归纳分类。",
        "focus": ["解剖学对器官组织的拆分", "细胞学说的历史背景"],
        "core_method": ["[[器官解剖观察法]]", "[[组织形态分析法]]"],
        "cognitive_type": "经验归纳/器官分类",
        "knowledge_module": "细胞学说的建立",
        "gaokao_dimension": ["基础性"]
    },
    "沃森和克里克": {
        "nationality": "美国/英国",
        "era": "20世纪50年代",
        "quick_recall": "构建DNA双螺旋物理模型，开创了分子生物学时代。",
        "common_trap": "误以为他们用高倍电镜直接拍到了双螺旋，其实是在前人生化和物理数据约束下进行物理建模出来的。",
        "focus": ["DNA双螺旋结构的主要特点", "碱基互补配对原则的构建"],
        "core_method": ["[[物理模型构建法]]"],
        "cognitive_type": "结构解析/假说建构",
        "knowledge_module": "DNA的结构与复制",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "沃泰默": {
        "nationality": "法国",
        "era": "19世纪末（1890年代）",
        "quick_recall": "发现胃酸刺激小肠促进胰液分泌，但由于坚持反射学说而否定了化学调节的存在。",
        "common_trap": "误以为他设计了错误的方法，其实他方法很严密，只是在反射弧概念束缚下进行了偏执的结论解释。",
        "focus": ["胃酸刺激促进胰液分泌实验", "神经反射权威下的盲区"],
        "core_method": ["[[动物消化腺切除与神经切断实验]]"],
        "cognitive_type": "实验实证/范式局限",
        "knowledge_module": "激素调节的发现",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "洛伊": {
        "nationality": "德国/美国",
        "era": "1921年",
        "quick_recall": "通过双蛙心灌流实验证明了突变传递是通过乙酰胆碱等化学递质完成的。",
        "common_trap": "误以为化学递质可以在突触间双向传输，其因递质只能由前膜释放作用于后膜而只能单向传递。",
        "focus": ["双蛙心灌流实验的设计", "突触传递中化学递质（乙酰胆碱）的实证"],
        "core_method": ["[[蛙心体外灌流对照实验]]", "[[生化成分提取分析法]]"],
        "cognitive_type": "实验实证/假说推导",
        "knowledge_module": "神经调节",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "温特": {
        "nationality": "荷兰",
        "era": "1928年",
        "quick_recall": "胚芽鞘尖端琼脂块实验证实胚芽鞘弯曲是由于尖端产生的生长素分布不均导致的。",
        "common_trap": "误以为他提取并测定了生长素的化学结构式，他仅确定了具有生长效应的化学活性物质的存在。",
        "focus": ["琼脂块去尖端胚芽鞘实验", "生长素命名的历史过程"],
        "core_method": ["[[琼脂块化学物质转移实验]]"],
        "cognitive_type": "实验实证/概念定义",
        "knowledge_module": "植物生长素的发现与作用",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "班廷": {
        "nationality": "加拿大",
        "era": "20世纪20年代（1921-1922年）",
        "quick_recall": "通过胰管结扎让胰腺外分泌部萎缩，成功提取活性胰岛素并治疗糖尿病。",
        "common_trap": "误以为他直接研磨新鲜胰腺即成功，直接研磨会被胰蛋白酶破坏，结扎萎缩排除干扰是关键。",
        "focus": ["胰管结扎提取活性胰岛素", "血糖平衡调节与糖尿病治疗"],
        "core_method": ["[[腺体结扎法]]", "[[活性物质提取与注射]]"],
        "cognitive_type": "实验实证/应用转化",
        "knowledge_module": "血糖调节",
        "gaokao_dimension": ["基础性", "综合性", "应用性"]
    },
    "科伦斯": {
        "nationality": "德国",
        "era": "19世纪末20世纪初",
        "quick_recall": "重新发现孟德尔定律，并发现紫茉莉等细胞质非典型遗传现象。",
        "common_trap": "误以为他仅从事孟德尔常染色体遗传研究，其实他是首个发现细胞质遗传规律的先驱。",
        "focus": ["孟德尔定律的重新发现", "细胞质遗传现象"],
        "core_method": ["[[杂交育种观察法]]"],
        "cognitive_type": "实验验证/范式超越",
        "knowledge_module": "遗传与变异",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "科恩": {
        "nationality": "美国",
        "era": "20世纪70年代",
        "quick_recall": "与博耶合作将外源基因拼入质粒载体，构建重组质粒，发明DNA重组技术。",
        "common_trap": "误以为他独立制备了限制酶，他主要是将质粒的复制和酶切重组整合，开发了转化系统。",
        "focus": ["质粒作为载体的发现与改造", "DNA重组与转化技术"],
        "core_method": ["[[重组质粒转化法]]", "[[质粒构建工程]]"],
        "cognitive_type": "技术集成/工程构建",
        "knowledge_module": "基因工程",
        "gaokao_dimension": ["综合性", "应用性"]
    },
    "科赫": {
        "nationality": "德国",
        "era": "19世纪末（1843-1910年）",
        "quick_recall": "提出鉴定传染病原的科赫法则，细菌纯种分离培养技术的奠基人。",
        "common_trap": "误以为科赫法则不能用于病毒等非细胞生物，其实需结合抗体及分子PCR进行法则技术修正。",
        "focus": ["科赫法则的具体步骤", "特定微生物病原体的鉴定"],
        "core_method": ["[[纯种分离培养法]]", "[[病原体接种致病法]]"],
        "cognitive_type": "范式建立/逻辑实证",
        "knowledge_module": "微生物培养与应用",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "穆利斯": {
        "nationality": "美国",
        "era": "20世纪80年代（1944-2019年）",
        "quick_recall": "发明PCR体外扩增特定DNA技术，获1993年诺贝尔化学奖。",
        "common_trap": "误以为PCR扩增在细胞内进行，其实它是体外热循环反应，不需要引物RNA酶等参与。",
        "focus": ["PCR的原理及基本反应步骤", "Taq聚合酶在PCR中的作用"],
        "core_method": ["[[体外热循环扩增技术]]"],
        "cognitive_type": "技术创新/生化工程",
        "knowledge_module": "PCR技术",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "米尔斯坦和柯勒": {
        "nationality": "阿根廷/德国",
        "era": "1975年",
        "quick_recall": "发明骨髓瘤细胞与B淋巴细胞融合杂交瘤技术以批量生产单克隆抗体。",
        "common_trap": "误以为融合后的混合细胞直接可用于抗体提取，必须在HAT等选择性培养基筛选后进行克隆化检测。",
        "focus": ["动物细胞融合与单克隆抗体技术", "杂交瘤细胞的筛选与培养"],
        "core_method": ["[[细胞融合技术]]", "[[选择性培养基筛选与克隆化培养]]"],
        "cognitive_type": "技术整合/工程实践",
        "knowledge_module": "单克隆抗体技术",
        "gaokao_dimension": ["基础性", "综合性", "应用性"]
    },
    "米歇尔": {
        "nationality": "英国",
        "era": "20世纪60-70年代（1920-1992年）",
        "quick_recall": "提出质子梯度跨膜电化学驱动ATP合成的“化学渗透假说”，获诺贝尔奖。",
        "common_trap": "误以为线粒体中ATP是水解酶直接催化ADP脱水合成的，它是依靠质子梯度驱动ATP合酶旋转合成的。",
        "focus": ["化学渗透假说的主要内容", "线粒体内膜的ATP合成机制"],
        "core_method": ["[[膜电位与梯度测量]]", "[[假说构建法]]"],
        "cognitive_type": "假说建构/物理跨界",
        "knowledge_module": "能量代谢（呼吸与光合）",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "约翰逊": {
        "nationality": "丹麦",
        "era": "20世纪初（1909年）",
        "quick_recall": "定义了“基因”、“表现型”、“基因型”等遗传学术语，理顺了遗传学逻辑。",
        "common_trap": "误以为他发现了DNA化学结构，他只定义了孟德尔所谓的遗传因子为“基因”。",
        "focus": ["表现型与基因型概念", "遗传学术语的界定与历史"],
        "core_method": ["[[概念提炼法]]"],
        "cognitive_type": "概念厘清/逻辑抽象",
        "knowledge_module": "遗传学基本概念",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "维萨里": {
        "nationality": "比利时",
        "era": "16世纪",
        "quick_recall": "发表《人体的构造》，开辟现代人体解剖实证研究，打破经院哲学神话。",
        "common_trap": "误以为他是在微观下研究细胞，他完全是在器官解剖层面推动医学由神话转向实证。",
        "focus": ["人体解剖学对生理学建立的推动", "细胞学说前科学史"],
        "core_method": ["[[系统尸体解剖法]]"],
        "cognitive_type": "实证观察/打破权威",
        "knowledge_module": "细胞学说建立的背景",
        "gaokao_dimension": ["基础性"]
    },
    "罗伯特·胡克": {
        "nationality": "英国",
        "era": "17世纪中叶（1635-1703年）",
        "quick_recall": "用自制显微镜首次观察并命名细胞“Cell”。",
        "common_trap": "误以为他观察到的是活体植物细胞，他其实观察到的是已木质化的木栓死细胞壁所包围的空腔。",
        "focus": ["细胞的发现与命名历史", "显微镜在细胞发现中的应用"],
        "core_method": ["[[自制显微镜检法]]"],
        "cognitive_type": "实证观察/概念创立",
        "knowledge_module": "细胞学说建立的背景",
        "gaokao_dimension": ["基础性"]
    },
    "罗伯特森": {
        "nationality": "美国",
        "era": "20世纪50年代（1924-1995年）",
        "quick_recall": "电镜下观察到“暗-明-暗”三层结构，提出静态单位膜模型。",
        "common_trap": "误以为他认识到了细胞膜的流动性，他的三明治单位膜模型是死板和静态的。",
        "focus": ["电镜下暗-明-暗的三层结构", "单位膜模型的静态局限性"],
        "core_method": ["[[超薄切片电镜观察法]]"],
        "cognitive_type": "结构解析/假说局限",
        "knowledge_module": "细胞膜的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "艾弗里": {
        "nationality": "美国",
        "era": "20世纪40年代（1877-1955年）",
        "quick_recall": "用肺炎链球菌体外转化实验证明DNA是遗传物质，揭幕生命化学本源。",
        "common_trap": "混淆体内（格里菲思）与体外（艾弗里）转化实验，误以为他得出了DNA是主要遗传物质的结论。",
        "focus": ["体外转化实验逻辑", "减法原理应用", "证明DNA是遗传物质"],
        "core_method": ["[[加法与减法原理]]", "[[对比实验法]]"],
        "cognitive_type": "逻辑推演/生化提纯",
        "knowledge_module": "遗传物质的探究",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "苏姆纳": {
        "nationality": "美国",
        "era": "20世纪初（1887-1955年）",
        "quick_recall": "结晶并证明了酶（脲酶）的本质是蛋白质，推翻了当时酶不是蛋白质的传统断言。",
        "common_trap": "误以为他首创了酶是RNA的定义，他只证明了脲酶是蛋白质，酶是RNA由切赫等发现。",
        "focus": ["脲酶结晶的提纯与鉴定", "酶本质概念的历史发展"],
        "core_method": ["[[蛋白质结晶纯化技术]]", "[[化学本质鉴定法]]"],
        "cognitive_type": "实验实证/生化解析",
        "knowledge_module": "酶的本质与功能",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "茨维特": {
        "nationality": "俄罗斯",
        "era": "20世纪初（1872-1919年）",
        "quick_recall": "发明柱色谱技术并用于植物叶绿素组分分离，是色谱学的奠基人。",
        "common_trap": "误以为高中课本中的纸层析法是他发明的，课本方法是色谱吸附原理的滤纸版演变。",
        "focus": ["层析法的基本原理", "叶绿素组分的分开历史"],
        "core_method": ["[[色谱层析分离法]]"],
        "cognitive_type": "技术开发/结构解析",
        "knowledge_module": "细胞代谢（光合作用实验）",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "萨克斯": {
        "nationality": "德国",
        "era": "19世纪中叶（1832-1897年）",
        "quick_recall": "半遮光半曝光的叶片碘蒸汽实验证实光合作用产物包括淀粉。",
        "common_trap": "误以为实验可以直接进行，为了排除干扰，必须提前暗处理植物以消耗累积淀粉。",
        "focus": ["半遮光半曝光的实验设计", "碘液检测淀粉产生的原理与前处理"],
        "core_method": ["[[自身对照法]]", "[[暗处理消耗淀粉]]", "[[酒精脱色与碘液检测]]"],
        "cognitive_type": "实验实证/对照设计",
        "knowledge_module": "细胞代谢（光合作用）",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "萨顿": {
        "nationality": "美国",
        "era": "20世纪初（1902年）",
        "quick_recall": "通过蝗虫减数分裂观察平行行为，用类比推理提出“基因在染色体上”假说。",
        "common_trap": "误以为萨顿实验完成了基因在染色体上的实证，其实他只提出了类比推理假说。",
        "focus": ["基因与染色体行为的平行关系", "类比推理法在科学假说中的作用"],
        "core_method": ["[[类比推理法]]", "[[显微镜检减数分裂]]"],
        "cognitive_type": "类比联想/逻辑推演",
        "knowledge_module": "遗传规律（萨顿假说）",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "薛定谔": {
        "nationality": "奥地利",
        "era": "20世纪中叶（1887-1961年）",
        "quick_recall": "理论物理学家，发表《生命是什么》提出“负熵”与“非周期性晶体”感召科学家跨界。",
        "common_trap": "误以为他发现了DNA碱基配对，他只是提出了遗传密码必须是稳定且非周期性晶体的假说。",
        "focus": ["非周期性晶体假说与遗传密码预测", "“负熵”与生命本质理论"],
        "core_method": ["[[理论物理交叉推理]]"],
        "cognitive_type": "跨界整合/理论构建",
        "knowledge_module": "分子生物学史",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "詹纳": {
        "nationality": "英国",
        "era": "18世纪末（1796年）",
        "quick_recall": "种牛痘成功预防天花，免疫学之父，创造人类首个活体疫苗。",
        "common_trap": "误以为他在发现病毒和免疫受体后才进行种痘，其实他纯属基于直觉和经验关系取得成功。",
        "focus": ["牛痘预防天花的接种实验", "特异性免疫防病的历史演进"],
        "core_method": ["[[临床经验总结法]]", "[[接种预防实验]]"],
        "cognitive_type": "经验归纳/应用转化",
        "knowledge_module": "免疫调节",
        "gaokao_dimension": ["基础性", "应用性"]
    },
    "贝利斯和斯他林": {
        "nationality": "英国",
        "era": "20世纪初（1902年）",
        "quick_recall": "小肠黏膜磨碎离体注射实验发现人类首个激素——促胰液素。",
        "common_trap": "误以为他们注射稀盐酸到血液促使胰液分泌，其实是稀盐酸刺激黏膜产生的化学物质起作用。",
        "focus": ["促胰液素发现的实验设计与控制", "内分泌调节概念的建立"],
        "core_method": ["[[器官研磨液离体注射法]]", "[[切除神经对照实验]]"],
        "cognitive_type": "实验实证/直觉突破",
        "knowledge_module": "激素调节",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "贝尔纳": {
        "nationality": "法国",
        "era": "19世纪（1857年）",
        "quick_recall": "首次提出“内环境”概念，恒定是生命自由存活的前提。",
        "common_trap": "误以为他主张内环境是静止的，其实他的恒定是一种不断摆动又复位的动态平衡。",
        "focus": ["内环境概念的提出", "生理学实验实证方法"],
        "core_method": ["[[生理活体实验法]]"],
        "cognitive_type": "概念建构/系统哲学",
        "knowledge_module": "内环境与稳态",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "赫尔希和蔡斯": {
        "nationality": "美国",
        "era": "20世纪50年代",
        "quick_recall": "放射性同位素标记噬菌体侵染实验，证明DNA是T2噬菌体的遗传物质。",
        "common_trap": "混淆搅拌与离心的作用，搅拌是为了使吸附的噬菌体外壳与细菌分离，离心是为了分层。",
        "focus": ["噬菌体侵染实验设计与过程", "同位素标记的选择（35S与32P）"],
        "core_method": ["[[同位素标记法]]", "[[差速离心与搅拌技术]]"],
        "cognitive_type": "实验实证/系统对照",
        "knowledge_module": "遗传物质的探究",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "辛格和尼科尔森": {
        "nationality": "美国",
        "era": "20世纪70年代（1972年）",
        "quick_recall": "提出细胞膜流动镶嵌模型，描述了生物膜的动态特征。",
        "common_trap": "误以为所有的膜蛋白都可以移动，其实有部分蛋白是固定且不对称排布的。",
        "focus": ["流动镶嵌模型的主要内容", "细胞膜结构的流动性与不对称性"],
        "core_method": ["[[模型构建法]]"],
        "cognitive_type": "结构解析/假说建构",
        "knowledge_module": "细胞膜的结构",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "达尔文": {
        "nationality": "英国",
        "era": "19世纪（1831-1882年）",
        "quick_recall": "自然选择学说创始人，晚年通过胚芽鞘单侧光实验开启生长素探索。",
        "common_trap": "误以为他在向光性实验中分离出了生长素，他只断定存在向下部传导并起效应的“刺激”。",
        "focus": ["自然选择学说的主要内容", "达尔文向光性实验设计"],
        "core_method": ["[[对比实验法]]", "[[演化假说推演]]"],
        "cognitive_type": "经验归纳/逻辑推演",
        "knowledge_module": "生物进化与生长素发现",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "阿尔农": {
        "nationality": "美国",
        "era": "1954年",
        "quick_recall": "发现离体叶绿体在光照下能合成ATP并产生NADPH，证实光合磷酸化。",
        "common_trap": "误以为阿尔农证明了碳同化路径，他主要揭示了光反应阶段的能量转换机制。",
        "focus": ["光合磷酸化的发现", "光反应能量转换机制"],
        "core_method": ["[[体外叶绿体悬浮合成实验]]", "[[放射性同位素追踪（32P）]]"],
        "cognitive_type": "实验实证/化学能量解析",
        "knowledge_module": "细胞代谢（光合作用）",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "高斯": {
        "nationality": "苏联",
        "era": "20世纪30年代（1934年）",
        "quick_recall": "草履虫竞争实验提出竞争排斥原理，描述了生态位的基本规律。",
        "common_trap": "误以为所有重叠生态位的物种在自然界都无法共存，其实可通过空间/时间发生生态位分化而共存。",
        "focus": ["草履虫混合培养的种间竞争曲线", "生态位与竞争排斥原理"],
        "core_method": ["[[种群混合培养对照]]", "[[数学模型模拟分析]]"],
        "cognitive_type": "实验实证/数学建模",
        "knowledge_module": "种群与群落",
        "gaokao_dimension": ["基础性", "综合性"]
    },
    "魏尔肖": {
        "nationality": "德国",
        "era": "19世纪中叶（1821-1902年）",
        "quick_recall": "总结出“一切细胞都来源于现有的细胞”，最终完善了细胞学说。",
        "common_trap": "误以为细胞学说的所有内容都是他一个人总结的，他只是补充了细胞的发生。",
        "focus": ["“新细胞产生自老细胞”的科学结论", "细胞学说的完善历程"],
        "core_method": ["[[显微病理学观察法]]"],
        "cognitive_type": "理论整合/医学应用",
        "knowledge_module": "细胞学说",
        "gaokao_dimension": ["基础性"]
    },
    "鲁宾和卡门": {
        "nationality": "美国",
        "era": "20世纪40年代",
        "quick_recall": "用氧的同位素18O分别标记水和二氧化碳，证明光合作用氧气来自水。",
        "common_trap": "误以为他们使用了放射性同位素，18O是稳定同位素，需要依靠质谱密度分析。",
        "focus": ["同位素标记法实验设计", "光合作用氧气来源证明"],
        "core_method": ["[[稳定同位素标记法]]", "[[质谱分析法]]"],
        "cognitive_type": "实验实证/定量检测",
        "knowledge_module": "细胞代谢（光合作用）",
        "gaokao_dimension": ["基础性", "综合性", "创新性"]
    },
    "鲍林": {
        "nationality": "美国",
        "era": "20世纪50年代（1901-1994年）",
        "quick_recall": "提出蛋白质α-螺旋二级结构模型，启发了DNA双螺旋的物理建模方法。",
        "common_trap": "误以为他发现了双螺旋，他在DNA竞争中因模型碱基向外、磷酸在内（错误极性）而失败。",
        "focus": ["蛋白质空间结构模型", "物理分子模型构建法"],
        "core_method": ["[[分子结构模型构建法]]"],
        "cognitive_type": "结构解析/物理建模",
        "knowledge_module": "蛋白质的结构",
        "gaokao_dimension": ["综合性", "创新性"]
    },
    "鲍森·詹森": {
        "nationality": "丹麦",
        "era": "1910年代",
        "quick_recall": "胚芽鞘插入明胶与云母片实验证明尖端产生的刺激可通过明胶透向下部。",
        "common_trap": "误以为他使用琼脂块做插片，明胶与云母的对比才是此实验证明物质透性的核心。",
        "focus": ["明胶与云母插片对比实验", "向光性化学物质传导的初步验证"],
        "core_method": ["[[透性材料插片对照法]]"],
        "cognitive_type": "实验实证/逻辑推断",
        "knowledge_module": "植物生长素的发现",
        "gaokao_dimension": ["基础性", "综合性"]
    }
}

def format_yaml_frontmatter(fm: dict) -> str:
    lines = ["---"]
    for key in sorted(fm.keys()):
        val = fm[key]
        if val is None:
            lines.append(f"{key}: null")
        elif isinstance(val, bool):
            lines.append(f"{key}: {str(val).lower()}")
        elif isinstance(val, (int, float)):
            lines.append(f"{key}: {val}")
        elif isinstance(val, str):
            if "\n" in val or ":" in val or "#" in val or val.startswith("-"):
                escaped = val.replace('"', '\\"')
                lines.append(f'{key}: "{escaped}"')
            else:
                lines.append(f"{key}: {val}")
        elif isinstance(val, list):
            lines.append(f"{key}:")
            for item in val:
                if str(item).startswith("[[") and str(item).endswith("]]"):
                    lines.append(f"  - '{item}'")
                elif ":" in str(item) or "#" in str(item):
                    lines.append(f'  - "{item}"')
                else:
                    lines.append(f"  - {item}")
        elif isinstance(val, dict):
            lines.append(f"{key}:")
            for subkey, subval in sorted(val.items()):
                if isinstance(subval, list):
                    lines.append(f"  {subkey}:")
                    for item in subval:
                        if ":" in str(item) or "#" in str(item):
                            lines.append(f'    - "{item}"')
                        else:
                            lines.append(f"    - {item}")
                elif subval is None:
                    lines.append(f"  {subkey}: null")
                else:
                    if ":" in str(subval) or "#" in str(subval):
                        lines.append(f'  {subkey}: "{subval}"')
                    else:
                        lines.append(f"  {subkey}: {subval}")
    lines.append("---")
    return "\n".join(lines)

def run():
    updated_count = 0
    for filename in sorted(os.listdir(SCIENTISTS_DIR)):
        if not filename.endswith('.md'):
            continue
        file_id = filename[:-3]
        filepath = os.path.join(SCIENTISTS_DIR, filename)
        
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            content = f.read()
            
        match = re.match(r'^---\r?\n(.*?)\r?\n---', content, re.DOTALL)
        if not match:
            print(f"[ERROR] No frontmatter in {filename}")
            continue
            
        yaml_str = match.group(1)
        # Pre-process raw double-bracket lists for intersection to make it valid YAML
        yaml_str = re.sub(r'intersection:\s*\[\[(.+?)\]\],\s*\[\[(.+?)\]\]', r"intersection:\n  - '[[\1]]'\n  - '[[\2]]'", yaml_str)
        
        body = content[match.end():]
        
        try:
            fm = yaml.safe_load(yaml_str) or {}
        except Exception as e:
            print(f"[ERROR] YAML parse failed for {filename}: {e}")
            continue
            
        # Get DB entries
        db_entry = DATA.get(file_id, {})
        if not db_entry:
            # If not in DATA (meaning it is complete, like Mendel, Pasteur, Crick, Calvin), check gaokao_dimension/starry_gaokao
            pass
            
        # Standardize priority formatting: make sure red circle priority has \U0001F534 emoji formatted right
        priority = fm.get('priority', '')
        if '核心' in str(priority) and not str(priority).startswith('🔴') and not str(priority).startswith('\\U'):
            fm['priority'] = '🔴核心必考'
            
        # Update nationality and era if missing or '未知'
        nat = fm.get('nationality', '')
        if nat in ['', '未知', None] and 'nationality' in db_entry:
            fm['nationality'] = db_entry['nationality']
        era = fm.get('era', '')
        if era in ['', '未知', None] and 'era' in db_entry:
            fm['era'] = db_entry['era']
            
        # Update quick_recall and common_trap
        qr = fm.get('quick_recall', '')
        if not qr and 'quick_recall' in db_entry:
            fm['quick_recall'] = db_entry['quick_recall']
        ct = fm.get('common_trap', '')
        if not ct and 'common_trap' in db_entry:
            fm['common_trap'] = db_entry['common_trap']
            
        # Update focus and core_method
        focus = fm.get('focus', [])
        if not focus and 'focus' in db_entry:
            fm['focus'] = db_entry['focus']
        core_method = fm.get('core_method', [])
        if not core_method and 'core_method' in db_entry:
            fm['core_method'] = db_entry['core_method']
            
        # Update cognitive_type
        cog = fm.get('cognitive_type', '')
        if not cog and 'cognitive_type' in db_entry:
            fm['cognitive_type'] = db_entry['cognitive_type']
            
        # Update starry_gaokao
        starry = fm.get('starry_gaokao', {}) or {}
        if not isinstance(starry, dict):
            starry = {}
            
        # If knowledge_module is missing, fill it
        km = starry.get('knowledge_module', '')
        if not km:
            if 'knowledge_module' in db_entry:
                starry['knowledge_module'] = db_entry['knowledge_module']
            elif '遗传规律' in str(fm.get('tags', '')):
                starry['knowledge_module'] = '遗传规律'
            elif '细胞' in str(fm.get('tags', '')):
                starry['knowledge_module'] = '细胞的结构与功能'
            else:
                starry['knowledge_module'] = '生物科学史'
                
        # If gaokao_dimension is missing, fill it
        gd = starry.get('gaokao_dimension', [])
        if not gd:
            if 'gaokao_dimension' in db_entry:
                starry['gaokao_dimension'] = db_entry['gaokao_dimension']
            else:
                starry['gaokao_dimension'] = ["基础性", "综合性"]
                
        fm['starry_gaokao'] = starry
        
        # Write back
        new_fm_str = format_yaml_frontmatter(fm)
        new_content = new_fm_str + body
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1

    print(f"Successfully processed {updated_count} files.")

if __name__ == '__main__':
    run()
