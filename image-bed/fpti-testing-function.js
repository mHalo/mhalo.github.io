/**
 * FPTI 绿茵人格测试 — 计算核心 (MVC 逻辑层)
 *
 * 用法：
 * const result = calcFPTI([1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1]);
 * // 返回值包含最终人格的所有 UI 渲染信息（不再依赖外部 JSON）
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.FPTI = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  // ===== 1. 结果库：8种人格类型（UI信息由JS返回） =====
  var TYPES = [
    {
      id: "FIRE",
      name: "激情燃梦者",
      eng: "THE FIRE",
      color: "#e74c3c",
      attrs: ["热血100%", "乐观90%", "感染力80%"],
      trait: "相信足球能点燃生活热情，永远是场边呐喊最响亮的人",
      recommendTeams: ["巴西", "阿根廷"],
      message: "保持热爱，奔赴山海",
    },
    {
      id: "MIND",
      name: "战术鉴赏家",
      eng: "THE MIND",
      color: "#3498db",
      attrs: ["理性95%", "逻辑90%", "洞察力85%"],
      trait: "冷静客观，能看到进球背后的逻辑和战术博弈",
      recommendTeams: ["德国", "意大利"],
      message: "智慧看球，享受博弈的乐趣",
    },
    {
      id: "HEART",
      name: "忠诚守望者",
      eng: "THE HEART",
      color: "#e91e90",
      attrs: ["长情100%", "坚韧90%", "归属感80%"],
      trait: "不随波逐流，为心中那抹颜色始终坚守",
      recommendTeams: ["阿根廷", "英格兰"],
      message: "陪伴是最长情的告白",
    },
    {
      id: "ART",
      name: "优雅生活家",
      eng: "THE ART",
      color: "#9b59b6",
      attrs: ["审美95%", "格调90%", "松弛感85%"],
      trait: "把看球当作生活美学的延伸，注重仪式感",
      recommendTeams: ["法国", "西班牙"],
      message: "让足球成为生活美学的一部分",
    },
    {
      id: "VIBE",
      name: "社交联结者",
      eng: "THE VIBE",
      color: "#f39c12",
      attrs: ["开朗100%", "分享欲90%", "包容80%"],
      trait: "用足球连接朋友，最会带动气氛的欢乐派",
      recommendTeams: ["巴西", "英格兰"],
      message: "以球会友，快乐至上",
    },
    {
      id: "EYE",
      name: "理性观察者",
      eng: "THE EYE",
      color: "#1abc9c",
      attrs: ["冷静95%", "独立90%", "客观85%"],
      trait: "从不盲目跟风，习惯站在旁观者角度审视比赛",
      recommendTeams: ["荷兰", "德国"],
      message: "保持独立思考，享受观赛乐趣",
    },
    {
      id: "MAGIC",
      name: "奇迹期待者",
      eng: "THE MAGIC",
      color: "#e67e22",
      attrs: ["浪漫90%", "惊喜85%", "包容心80%"],
      trait: "相信足球的不可预测性，期待每一个奇迹瞬间",
      recommendTeams: ["法国", "葡萄牙"],
      message: "相信奇迹，拥抱惊喜",
    },
    {
      id: "CHILL",
      name: "佛系养生派",
      eng: "THE CHILL",
      color: "#2ecc71",
      attrs: ["平和100%", "随缘90%", "豁达85%"],
      trait: "享受看球过程，不被结果焦虑所困扰",
      recommendTeams: ["意大利", "西班牙"],
      message: "心态平和，享受当下",
    },
  ];

  // ===== 2. 映射表：三维度轴 → 人格 =====
  var AXIS_MAP = {
    E_F_P: "FIRE",
    E_F_J: "HEART",
    E_T_P: "MAGIC",
    E_T_J: "VIBE",
    I_F_P: "ART",
    I_F_J: "CHILL",
    I_T_P: "EYE",
    I_T_J: "MIND",
  };

  var AXIS_LABELS = {
    E: "外向",
    I: "内向",
    F: "感性",
    T: "理性",
    P: "变动",
    J: "稳定",
  };

  // ===== 3. 计分规则表 (与前端 JSON 的题目顺序与选项顺序强绑定) =====
  var QUESTIONS = [
    // Q1-4: EI轴
    { id: 1, axis: "EI", opts: [{ pole: "E" }, { pole: "I" }, { pole: "E" }, { pole: "I" }] },
    { id: 2, axis: "EI", opts: [{ pole: "E" }, { pole: "E" }, { pole: "I" }, { pole: "I" }] },
    { id: 3, axis: "EI", opts: [{ pole: "E" }, { pole: "I" }, { pole: "E" }, { pole: "I" }] },
    { id: 4, axis: "EI", opts: [{ pole: "E" }, { pole: "E" }, { pole: "I" }, { pole: "I" }] },
    // Q5-8: FT轴
    { id: 5, axis: "FT", opts: [{ pole: "T" }, { pole: "F" }, { pole: "F" }, { pole: "T" }] },
    { id: 6, axis: "FT", opts: [{ pole: "F" }, { pole: "T" }, { pole: "T" }, { pole: "F" }] },
    { id: 7, axis: "FT", opts: [{ pole: "F" }, { pole: "T" }, { pole: "T" }, { pole: "F" }] },
    { id: 8, axis: "FT", opts: [{ pole: "F" }, { pole: "F" }, { pole: "T" }, { pole: "T" }] },
    // Q9-15: PJ轴
    { id: 9, axis: "PJ", opts: [{ pole: "J" }, { pole: "P" }, { pole: "P" }, { pole: "J" }] },
    { id: 10, axis: "PJ", opts: [{ pole: "P" }, { pole: "J" }, { pole: "P" }, { pole: "J" }] },
    { id: 11, axis: "PJ", opts: [{ pole: "J" }, { pole: "P" }, { pole: "J" }, { pole: "P" }] },
    { id: 12, axis: "PJ", opts: [{ pole: "J" }, { pole: "J" }, { pole: "P" }, { pole: "P" }] },
    { id: 13, axis: "PJ", opts: [{ pole: "P" }, { pole: "J" }, { pole: "P" }, { pole: "J" }] },
    { id: 14, axis: "PJ", opts: [{ pole: "P" }, { pole: "J" }, { pole: "P" }, { pole: "J" }] },
    { id: 15, axis: "PJ", opts: [{ pole: "P" }, { pole: "J" }, { pole: "J" }, { pole: "P" }] },
  ];

  /**
   * 计算最终测试结果
   * @param {number[]} answers — 用户答案数组，每项 1~4
   */
  function calcFPTI(answers) {
    if (!answers || answers.length !== QUESTIONS.length) {
      throw new Error("answers 长度必须为 " + QUESTIONS.length + "，且每项取值 1~4");
    }

    var axisScores = { E: 0, I: 0, F: 0, T: 0, P: 0, J: 0 };

    // 统计维度选项得分
    for (var i = 0; i < QUESTIONS.length; i++) {
      var answer = answers[i];
      if (answer < 1 || answer > 4) {
        throw new Error("answers[" + i + "] = " + answer + "，取值必须为 1~4");
      }
      var opt = QUESTIONS[i].opts[answer - 1];
      axisScores[opt.pole] = (axisScores[opt.pole] || 0) + 1;
    }

    // 判定胜出极（平局时用该轴第一题破局）
    function decideAxis(p1, p2, axisName) {
      var s1 = axisScores[p1] || 0;
      var s2 = axisScores[p2] || 0;
      if (s1 > s2) return p1;
      if (s2 > s1) return p2;
      
      for (var j = 0; j < QUESTIONS.length; j++) {
        if (QUESTIONS[j].axis === axisName) {
          var tbAnswer = answers[j];
          var tbOpt = QUESTIONS[j].opts[tbAnswer - 1];
          return tbOpt.pole === p1 ? p1 : p2;
        }
      }
      return p1;
    }

    var eiW = decideAxis("E", "I", "EI");
    var ftW = decideAxis("F", "T", "FT");
    var pjW = decideAxis("P", "J", "PJ");

    var axisKey = eiW + "_" + ftW + "_" + pjW;
    var typeId = AXIS_MAP[axisKey];
    var typeInfo = getType(typeId);

    // 组装最终渲染所需的对象返回给前端
    return {
      typeId: typeInfo.id,
      typeName: typeInfo.name,
      typeEng: typeInfo.eng,
      color: typeInfo.color,
      attrs: typeInfo.attrs,
      trait: typeInfo.trait,
      recommendTeams: typeInfo.recommendTeams,
      message: typeInfo.message,
      axisResult: {
        ei: { winner: eiW, scores: { E: axisScores["E"], I: axisScores["I"] } },
        ft: { winner: ftW, scores: { F: axisScores["F"], T: axisScores["T"] } },
        pj: { winner: pjW, scores: { P: axisScores["P"], J: axisScores["J"] } },
      },
    };
  }

  // 挂载辅助方法供前端偶尔需要拉取常量时使用
  function getType(typeid) {
    return TYPES.find(function (t) {
      return t.id === typeid;
    }) || null;
  }

  var FPTI = {
    calc: calcFPTI,
    TYPES: TYPES,
    AXIS_LABELS: AXIS_LABELS,
    getType: getType,
  };

  return FPTI;
});
