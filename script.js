// =================== 图片配置 ===================
const LEFT_IMAGE_COUNT = 2;   // pic_L1.png ~ pic_L2.png
const RIGHT_IMAGE_COUNT = 2;  // pic_R1.png ~ pic_R2.png
const BOTTOM_IMAGE_COUNT = 3; // pic_B1.png ~ pic_B3.png

// 陷阱拍卖配置
const auctionValue = 10;
let auctionYourBid = 0;
let auctionStrongBid = 0;

// 囚徒困境（三轮模式）
let prisonHistory = [];
let prisonTotalYou = 0;
let prisonTotalStrong = 0;

// 分赃后的豪赌（三色珠子游戏）
let gambleRound = 0;          // 已玩局数（0~10）
let gambleTotalCost = 0;      // 总成本
let gambleTotalReward = 0;    // 总奖励
let gambleTotalNet = 0;       // 总净收益

// =================== 工具函数 ===================

// 切换屏幕
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  updateDecorImages();
}

// [1, max] 随机整数
function randInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

// [min, max] 随机整数
function randIntRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 设置图片 src，如果失败就回退到 1 号图
function setSafeSrc(img, baseName, count) {
  const idx = randInt(count);
  const src = `${baseName}${idx}.png`;
  img.onerror = () => {
    img.onerror = null;
    img.src = `${baseName}1.png`;
  };
  img.src = src;
}

// 刷新左上 / 右上 / 底部图片
function updateDecorImages() {
  const left = document.getElementById("img-left");
  const right = document.getElementById("img-right");
  const bottom = document.getElementById("img-bottom");

  if (left && LEFT_IMAGE_COUNT > 0) {
    setSafeSrc(left, "pic_L", LEFT_IMAGE_COUNT);
  }
  if (right && RIGHT_IMAGE_COUNT > 0) {
    setSafeSrc(right, "pic_R", RIGHT_IMAGE_COUNT);
  }
  if (bottom && BOTTOM_IMAGE_COUNT > 0) {
    setSafeSrc(bottom, "pic_B", BOTTOM_IMAGE_COUNT);
  }
}

// 魔法试炼：随机 1~100
function roll100() {
  return Math.floor(Math.random() * 100) + 1;
}

// =================== 囚徒困境辅助 ===================

function resetPrisonRepeated() {
  prisonHistory = [];
  prisonTotalYou = 0;
  prisonTotalStrong = 0;
  const r2 = document.getElementById("prison-r2-prev");
  const r3a = document.getElementById("prison-r3-prev1");
  const r3b = document.getElementById("prison-r3-prev2");
  const sum = document.getElementById("prison-summary-detail");
  if (r2) r2.innerHTML = "";
  if (r3a) r3a.innerHTML = "";
  if (r3b) r3b.innerHTML = "";
  if (sum) sum.innerHTML = "";
}

// 神秘强者：第 1 轮先沉默，后面“复制你上一次”
function prisonStrongChoice(round) {
  if (round === 1) return "silent";
  if (prisonHistory.length === 0) return "silent";
  return prisonHistory[prisonHistory.length - 1].you;
}

// 算刑期
function prisonYears(choiceYou, choiceStrong) {
  if (choiceYou === "silent" && choiceStrong === "silent") {
    return { you: 1, strong: 1 };
  }
  if (choiceYou === "confess" && choiceStrong === "silent") {
    return { you: 0, strong: 10 };
  }
  if (choiceYou === "silent" && choiceStrong === "confess") {
    return { you: 10, strong: 0 };
  }
  return { you: 5, strong: 5 }; // 双方坦白
}

function makePrisonRoundLine(r) {
  const y = r.you === "silent" ? "沉默" : "坦白";
  const s = r.strong === "silent" ? "沉默" : "坦白";
  return `第 ${r.round} 轮：你选择 <span class="highlight">${y}</span>，对方选择 <span class="highlight">${s}</span> → 你 ${r.youYears} 年，对方 ${r.strongYears} 年。`;
}

function makePrisonOverallComment() {
  const choices = prisonHistory.map((r) => r.you);
  const allSilent = choices.every((c) => c === "silent");
  const allConfess = choices.every((c) => c === "confess");

  if (allSilent) {
    return `你三轮都选择沉默，给了合作结构最好的机会。<br />
      可惜现实世界里，遇到的未必都是“先合作、再跟随”的神秘强者。`;
  }
  if (allConfess) {
    return `你三轮都选择坦白，彻底放弃了任何互信的可能。<br />
      评价：你非常稳定，非常谨慎，也非常适合一个人过。`;
  }
  if (choices[0] === "confess" && choices.slice(1).includes("silent")) {
    return `你第一轮就先扎了一刀，后面又尝试恢复合作。<br />
      评价：典型“先自保再补救”型玩家。现实里，这种人朋友不多，但都很谨慎。`;
  }
  return `你的三轮选择时而沉默、时而坦白，在探索“信任”和“防备”之间的平衡。<br />
    囚徒困境里，短期算计和长期关系，总是在互相拉扯。`;
}

// =================== 陷阱拍卖辅助 ===================

function resetAuction() {
  auctionYourBid = 0;
  auctionStrongBid = 0;
  const status = document.getElementById("auction-status");
  const res = document.getElementById("auction-result");
  const input = document.getElementById("auction-input");
  if (status) {
    status.innerHTML =
      "当前还没有任何出价。标的是一张 10 元购物卡。<br />" +
      "你可以出价整数元，或输入 0 表示这轮不出价。所有出过价的人最后都要支付自己最高出价。";
  }
  if (res) res.innerHTML = "";
  if (input) input.value = "";
}

// =================== 三色珠子游戏辅助 ===================

// 重置 10 局游戏
function resetGambleGame() {
  gambleRound = 0;
  gambleTotalCost = 0;
  gambleTotalReward = 0;
  gambleTotalNet = 0;

  const status = document.getElementById("gamble-status");
  const log = document.getElementById("gamble-round-log");
  const summary = document.getElementById("gamble-summary");
  const btnPlay = document.getElementById("btn-gamble-play");

  if (status) {
    status.innerHTML =
      "你还没有开始游戏。<br />每一局先扣 <span class='highlight'>5 元</span>，至少玩满 10 局再看总战绩。";
  }
  if (log) log.innerHTML = "";
  if (summary) summary.innerHTML = "";
  if (btnPlay) {
    btnPlay.disabled = false;
    btnPlay.textContent = "开始第 1 局（-5 元）";
  }
}

// 抽一次结果（用概率大概贴近你写的那一套）
function sampleGambleOutcome() {
  const r = Math.random(); // 0 ~ 1

  // 按你给的“实际概率”大致来：
  // 头等奖：0.0155%
  // 好运奖：约 2%
  // 安慰奖：约 15%
  // 普通奖：约 33%
  // 回血局：约 48.7%（其余都丢给它）
  if (r < 0.000155) {
    // 头等奖
    const reward = 20;
    const net = reward - 5;
    return {
      level: "头等奖",
      pattern: "类似 8-4-0 / 8-0-4 这种极端偏色分布",
      reward,
      net,
    };
  } else if (r < 0.020155) {
    // 好运奖
    const reward = randIntRange(10, 19);
    const net = reward - 5;
    return {
      level: "好运奖",
      pattern: "比如 8-3-1 / 7-5-0 之类的“看上去就很欧”的组合",
      reward,
      net,
    };
  } else if (r < 0.170155) {
    // 安慰奖
    const reward = randIntRange(5, 9);
    const net = reward - 5;
    return {
      level: "安慰奖",
      pattern: "类似 6-4-2 / 6-3-3 这种“还算好看”的分布",
      reward,
      net,
    };
  } else if (r < 0.500155) {
    // 普通奖
    const reward = randIntRange(1, 4);
    const net = reward - 5;
    return {
      level: "普通奖",
      pattern: "例如 5-5-2 / 4-4-4 这种“说得过去但不惊喜”的分布",
      reward,
      net,
    };
  } else {
    // 回血局 543
    const reward = 10;
    const net = reward - 5;
    return {
      level: "回血局",
      pattern: "经典 5-4-3 分布，宣传口径里号称 48.7% 概率出现",
      reward,
      net,
    };
  }
}

// 玩一局三色珠子
function playOneGambleRound() {
  const status = document.getElementById("gamble-status");
  const log = document.getElementById("gamble-round-log");
  const summary = document.getElementById("gamble-summary");
  const btnPlay = document.getElementById("btn-gamble-play");

  if (!status || !log || !summary || !btnPlay) return;

  if (gambleRound >= 10) {
    status.innerHTML =
      "你已经玩满了 <span class='highlight'>10 局</span>。<br />如果不服，可以点“重新来 10 局”再试一轮抽象豪赌。";
    return;
  }

  gambleRound += 1;
  gambleTotalCost += 5;

  const outcome = sampleGambleOutcome();
  gambleTotalReward += outcome.reward;
  gambleTotalNet = gambleTotalReward - gambleTotalCost;

  const netText =
    outcome.net >= 0
      ? `净赚 <span class="highlight">${outcome.net}</span> 元`
      : `净亏 <span class="highlight">${-outcome.net}</span> 元`;

  const line = `第 ${gambleRound} 局：抽到 <span class="highlight">${outcome.level}</span>（${outcome.pattern}），获得 <span class="highlight">${outcome.reward}</span> 元，${netText}。`;

  if (log.innerHTML.trim() === "") {
    log.innerHTML = line;
  } else {
    log.innerHTML += "<br />" + line;
  }

  status.innerHTML = `当前已玩 <span class="highlight">${gambleRound}</span> / 10 局。`;

  let summaryHtml = `到目前为止：<br />
    · 总成本：<span class="highlight">${gambleTotalCost}</span> 元<br />
    · 总奖励：<span class="highlight">${gambleTotalReward}</span> 元<br />
    · 总净收益：`;

  if (gambleTotalNet > 0) {
    summaryHtml += `<span class="highlight">+${gambleTotalNet}</span> 元`;
  } else if (gambleTotalNet < 0) {
    summaryHtml += `<span class="highlight">${gambleTotalNet}</span> 元`;
  } else {
    summaryHtml += `<span class="highlight">0</span> 元`;
  }

  if (gambleRound >= 10) {
    btnPlay.disabled = true;
    btnPlay.textContent = "已完成 10 局";

    if (gambleTotalNet > 0) {
      summaryHtml += `<br /><br />结论：<br />
        你这 10 局总共是 <span class="highlight">赚钱</span> 的。<br />
        理论上可以截图找开发者“领奖”，<br />
        但现实世界里，这种游戏只会在长时间里慢慢把你变成“优质客户”。`;
    } else if (gambleTotalNet === 0) {
      summaryHtml += `<br /><br />结论：<br />
        你这 10 局刚好 <span class="highlight">打平</span>。<br />
        这种体验最危险，因为大脑会自动补全成：<br />
        “再玩 10 局，说不定就开始赚了。”`;
    } else {
      summaryHtml += `<br /><br />结论：<br />
        你这 10 局整体是 <span class="highlight">亏损</span> 的。<br />
        输了就别截图了，再截图特斯拉可能就要出发了。<br />
        赌场不怕你偶尔赢一两局，只怕你突然开窍不再玩。`;
    }
  }

  summary.innerHTML = summaryHtml;
  if (!btnPlay.disabled) {
    btnPlay.textContent = `开始第 ${gambleRound + 1} 局（-5 元）`;
  }
}

// =================== 初始化绑定 ===================

// 1）先刷新一次图片
updateDecorImages();

// 2）主页面：进入试炼选择菜单
const mainStartBtn = document.getElementById("btn-main-start");
if (mainStartBtn) {
  mainStartBtn.addEventListener("click", () => {
    showScreen("screen-trial-menu");
  });
}

// 3）所有带 data-goto 的按钮：通用跳转
document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-goto");
    if (targetId) showScreen(targetId);
  });
});

// =================== 魔法试炼 ===================

// 魔法简介 -> 选择武器
const magicStartBtn = document.getElementById("btn-magic-start");
if (magicStartBtn) {
  magicStartBtn.addEventListener("click", () => {
    showScreen("screen-weapon");
  });
}

// 选择武器
document
  .querySelectorAll("#screen-weapon [data-weapon]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const weapon = btn.getAttribute("data-weapon");
      if (weapon === "tesla") {
        showScreen("screen-tesla-choose");
      } else if (weapon === "charm") {
        showScreen("screen-charm-choose");
      } else if (weapon === "story") {
        showScreen("screen-story-choose");
      }
    });
  });

// 特斯拉之力：选择攻击目标
document
  .querySelectorAll("#screen-tesla-choose [data-tesla-target]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tesla-target");
      if (target === "ac") {
        showScreen("screen-tesla-ac");
      } else if (target === "boar") {
        showScreen("screen-tesla-boar");
      }
    });
  });

// 高之魅惑：选择对象
document
  .querySelectorAll("#screen-charm-choose [data-charm-target]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-charm-target");
      if (target === "ac") {
        showScreen("screen-charm-ac");
      } else if (target === "boar") {
        showScreen("screen-charm-boar");
      }
    });
  });

// 故事魔杖：三种策略
document
  .querySelectorAll("#screen-story-choose [data-story-option]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const opt = btn.getAttribute("data-story-option");
      if (opt === "boar") {
        showScreen("screen-story-boar");
        const el = document.getElementById("story-boar-result");
        if (el) el.textContent = "";
      } else if (opt === "ac") {
        showScreen("screen-story-ac");
        const el = document.getElementById("story-ac-result");
        if (el) el.textContent = "";
      } else if (opt === "pass") {
        showScreen("screen-story-pass");
        const el = document.getElementById("story-pass-result");
        if (el) el.textContent = "";
      }
    });
  });

// 故事魔杖：先控野猪王（X=30），输掉后自动回主页
const btnBoarRoll = document.getElementById("btn-story-boar-roll");
if (btnBoarRoll) {
  btnBoarRoll.addEventListener("click", () => {
    const roll = roll100();
    const X = 30;
    const el = document.getElementById("story-boar-result");
    if (!el) return;
    if (roll <= X) {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        这把你靠着<span class="highlight">运气 + 一点点脑子</span>赢了野猪王和空调大王。`;
    } else {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        运气不好，还不怎么动脑。<br />即将返回主页，请重新选择你的命运。`;
      setTimeout(() => {
        showScreen("screen-home");
      }, 1600);
    }
  });
}

// 故事魔杖：先控空调大王（X=38），输掉后自动回主页
const btnAcRoll = document.getElementById("btn-story-ac-roll");
if (btnAcRoll) {
  btnAcRoll.addEventListener("click", () => {
    const roll = roll100();
    const X = 38;
    const el = document.getElementById("story-ac-result");
    if (!el) return;
    if (roll <= X) {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        这把算是用故事魔杖硬生生抬回了一点尊严。`;
    } else {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        暂时既不是智将，也不是脸帝。<br />1.5 秒后自动回主页重开一把。`;
      setTimeout(() => {
        showScreen("screen-home");
      }, 1500);
    }
  });
}

// 故事魔杖：空放策略（X=60），输掉后自动回主页
const btnPassRoll = document.getElementById("btn-story-pass-roll");
if (btnPassRoll) {
  btnPassRoll.addEventListener("click", () => {
    const roll = roll100();
    const X = 60;
    const el = document.getElementById("story-pass-result");
    if (!el) return;
    if (roll <= X) {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        抽象的空放策略这次真的赢了。思路和运气都在线。`;
    } else {
      el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        策略是对的，这把纯属脸黑。<br />为保证体验，一会儿自动送你回主页。`;
      setTimeout(() => {
        showScreen("screen-home");
      }, 1700);
    }
  });
}

// =================== 海盗分金 ===================

const btnPirateStart = document.getElementById("btn-pirate-start");
if (btnPirateStart) {
  btnPirateStart.addEventListener("click", () => {
    const input = document.getElementById("pirate-input");
    const result = document.getElementById("pirate-result");
    if (input) input.value = "";
    if (result) result.textContent = "";
    showScreen("screen-pirate-game");
  });
}

const btnPirateSubmit = document.getElementById("btn-pirate-submit");
if (btnPirateSubmit) {
  btnPirateSubmit.addEventListener("click", () => {
    const inputEl = document.getElementById("pirate-input");
    const resultEl = document.getElementById("pirate-result");
    if (!inputEl || !resultEl) return;

    const raw = inputEl.value.trim();
    if (!raw) {
      resultEl.innerHTML =
        '至少先写点什么吧。<br />格式示例：<code>90,1,7,1,1</code>';
      return;
    }

    const parts = raw.replace(/，/g, ",").split(",");
    if (parts.length !== 5) {
      resultEl.innerHTML =
        "需要刚好 5 个数字，用英文逗号隔开。<br />例如：<code>90,1,7,1,1</code>";
      return;
    }

    const nums = [];
    for (let p of parts) {
      const n = parseInt(p.trim(), 10);
      if (Number.isNaN(n)) {
        resultEl.innerHTML = "你的输入里有不是整数的东西。";
        return;
      }
      if (n < 0) {
        resultEl.innerHTML = "想给别人负金币？那不叫分赃，叫诈骗。";
        return;
      }
      nums.push(n);
    }

    const [you, jack, yong, gao, xi] = nums;
    const sum = nums.reduce((a, b) => a + b, 0);

    if (sum !== 100) {
      resultEl.innerHTML = `五个数加起来是 <span class="highlight">${sum}</span>，不是 100。<br />
        连总数都没数清楚，就想当老大？特斯拉已经在原地热车了。`;
      return;
    }

    // 正解：98,0,1,0,1
    if (
      you === 98 &&
      jack === 0 &&
      yong === 1 &&
      gao === 0 &&
      xi === 1
    ) {
      resultEl.innerHTML = `
          ✅ <span class="highlight">通关！</span><br />
          你给自己 98，只用 1 枚金币收买雍、1 枚收买西，凑够 3 票通过。<br />
          在后续局面里，他们拿不到更好的，所以这 1 枚金币对他们来说是“白捡”，对你来说是“超值贿赂”。<br />
          评价：你不是来做公益的，你是真的懂博弈。`;
      return;
    }

    const maxCoin = Math.max(...nums);
    const minCoin = Math.min(...nums);

    // 暴力自肥型
    if (you >= 90 && yong === 0 && xi === 0) {
      resultEl.innerHTML = `
          ❌ 暴力自肥型。<br />
          你给自己塞了 <span class="highlight">${you}</span> 枚金币，雍和西一毛没有。<br />
          他们当然希望你被撞飞，下一轮说不定自己就能当老大。<br />
          评价：你把别人都当傻子，结果被制度当成了傻子。`;
      return;
    }

    // 好兄弟平分型
    if (maxCoin - minCoin <= 10) {
      resultEl.innerHTML = `
          ❌ 好兄弟公平分型。<br />
          你这方案基本是“兄弟齐心，其利断金，先别管我是不是要被撞飞”。<br />
          作为 1 号老大，既没多拿钱，也没稳住自己的票。<br />
          评价：适合当团建负责人，不太适合当海盗头子。`;
      return;
    }

    // 慈善家型：别人比你拿得多
    const othersMax = Math.max(jack, yong, gao, xi);
    if (othersMax > you) {
      resultEl.innerHTML = `
          ❌ 慈善家型。<br />
          有人拿的比你多：<span class="highlight">${othersMax}</span> &gt; 你的 <span class="highlight">${you}</span>。<br />
          你是出方案的人，不是来给队友发年终奖的金主爸爸。<br />
          评价：你适合写分赃协议书，但名字写错了，应该写在“最底下一行”。`;
      return;
    }

    // 贿赂错人型
    if ((jack > 0 || gao > 0) && yong === 0 && xi === 0) {
      resultEl.innerHTML = `
          ❌ 贿赂错人型。<br />
          你花金币去买 Jack 或高，却把雍和西晾在一边。<br />
          在标准 5 海盗局面里，真正好买的是雍和西，你现在是拿钱砸那些本来就不太想帮你的人。<br />
          评价：钱花出去了，票没买到。经典“冤大头”操作。`;
      return;
    }

    // 兜底
    resultEl.innerHTML = `
        ❌ 分配方案没命中任何已知策略。<br />
        我都没预测到还有这种分法。<br />
        评价：恭喜你，首创<span class="highlight">海盗界新型呆子分配方法</span>。<br />
        建议：多想想“谁在后续局面里最惨”，他们才是最好买的票。`;
  });
}

// =================== 囚徒困境 ===================

const btnPrisonerStart = document.getElementById("btn-prisoner-start");
if (btnPrisonerStart) {
  btnPrisonerStart.addEventListener("click", () => {
    showScreen("screen-prisoner-mode");
  });
}

// 一次性囚徒困境
document
  .querySelectorAll("#screen-prisoner-one-shot [data-prison-one-choice]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.getAttribute("data-prison-one-choice");
      if (choice === "silent") {
        showScreen("screen-prisoner-one-result-CS");
      } else {
        showScreen("screen-prisoner-one-result-CC");
      }
    });
  });

const goRepFromCS = document.getElementById("btn-prisoner-go-repeated-from-CS");
if (goRepFromCS) {
  goRepFromCS.addEventListener("click", () => {
    resetPrisonRepeated();
    showScreen("screen-prisoner-r1");
  });
}
const goRepFromCC = document.getElementById("btn-prisoner-go-repeated-from-CC");
if (goRepFromCC) {
  goRepFromCC.addEventListener("click", () => {
    resetPrisonRepeated();
    showScreen("screen-prisoner-r1");
  });
}

// 模式选择中的三轮审讯按钮
const btnPrisonerRepeated = document.getElementById("btn-prisoner-repeated");
if (btnPrisonerRepeated) {
  btnPrisonerRepeated.addEventListener("click", () => {
    resetPrisonRepeated();
    showScreen("screen-prisoner-r1");
  });
}

// 三轮审讯每一轮
document
  .querySelectorAll("[data-prison-round]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const round = parseInt(btn.getAttribute("data-prison-round"), 10);
      const choiceYou = btn.getAttribute("data-prison-choice");
      const choiceStrong = prisonStrongChoice(round);
      const years = prisonYears(choiceYou, choiceStrong);

      prisonHistory.push({
        round,
        you: choiceYou,
        strong: choiceStrong,
        youYears: years.you,
        strongYears: years.strong,
      });
      prisonTotalYou += years.you;
      prisonTotalStrong += years.strong;

      if (round === 1) {
        const prev = document.getElementById("prison-r2-prev");
        if (prev) prev.innerHTML = makePrisonRoundLine(prisonHistory[0]);
        showScreen("screen-prisoner-r2");
      } else if (round === 2) {
        const p1 = document.getElementById("prison-r3-prev1");
        const p2 = document.getElementById("prison-r3-prev2");
        if (p1) p1.innerHTML = makePrisonRoundLine(prisonHistory[0]);
        if (p2) p2.innerHTML = makePrisonRoundLine(prisonHistory[1]);
        showScreen("screen-prisoner-r3");
      } else if (round === 3) {
        const sumEl = document.getElementById("prison-summary-detail");
        if (sumEl) {
          let html = "";
          prisonHistory.forEach((r) => {
            html += makePrisonRoundLine(r) + "<br />";
          });
          html += `<br />三轮合计：你被判 <span class="highlight">${prisonTotalYou}</span> 年，对方 <span class="highlight">${prisonTotalStrong}</span> 年。<br /><br />`;
          html += makePrisonOverallComment();
          sumEl.innerHTML = html;
        }
        showScreen("screen-prisoner-summary");
      }
    });
  });

const btnPrisonerRestartRepeated = document.getElementById(
  "btn-prisoner-restart-repeated"
);
if (btnPrisonerRestartRepeated) {
  btnPrisonerRestartRepeated.addEventListener("click", () => {
    resetPrisonRepeated();
    showScreen("screen-prisoner-r1");
  });
}

// =================== 陷阱拍卖 ===================

const auctionStartBtn = document.getElementById("btn-auction-start");
if (auctionStartBtn) {
  auctionStartBtn.addEventListener("click", () => {
    resetAuction();
    showScreen("screen-auction-game");
  });
}

const btnAuctionBid = document.getElementById("btn-auction-bid");
if (btnAuctionBid) {
  btnAuctionBid.addEventListener("click", () => {
    const input = document.getElementById("auction-input");
    const status = document.getElementById("auction-status");
    const result = document.getElementById("auction-result");
    if (!input || !status || !result) return;

    const raw = input.value.trim();
    if (raw === "") {
      result.innerHTML = "先写一个整数出价，或者 0 表示不出价。";
      return;
    }

    const bid = parseInt(raw, 10);
    if (Number.isNaN(bid) || bid < 0) {
      result.innerHTML = "出价需要是一个大于等于 0 的整数。";
      return;
    }

    // 首轮旁观：你 0，对方 1
    if (bid === 0 && auctionYourBid === 0 && auctionStrongBid === 0) {
      auctionStrongBid = 1;
      status.innerHTML = `
          你选择不出价。<br />
          神秘强者出价 <span class="highlight">1 元</span>，拿走了 10 元购物卡。<br />
          最终需要支付：你 0 元，对方 1 元。`;
      result.innerHTML =
        "评价：你站在坑外面，看别人示范了一次“用 1 元买 10 元”的实验。";
      return;
    }

    if (bid <= auctionYourBid) {
      result.innerHTML = `你的出价必须高于你之前的最高出价（当前是 ${auctionYourBid}）。`;
      return;
    }

    if (bid <= auctionStrongBid) {
      result.innerHTML = `当前神秘强者最高出价是 ${auctionStrongBid}，你的出价需要更高才算新的出价。`;
      return;
    }

    // 有效新出价：对手自动 X+1
    auctionYourBid = bid;
    auctionStrongBid = auctionYourBid + 1;

    status.innerHTML = `
        当前局面：<br />
        · 你最高出价：<span class="highlight">${auctionYourBid}</span> 元<br />
        · 神秘强者最高出价：<span class="highlight">${auctionStrongBid}</span> 元<br />
        · 标的价值：<span class="highlight">${auctionValue}</span> 元<br />
        拍卖仍在进行中，你可以继续加价，或者点击“认输 / 停止”。`;

    result.innerHTML = "";
    input.value = "";
  });
}

const btnAuctionGiveup = document.getElementById("btn-auction-giveup");
if (btnAuctionGiveup) {
  btnAuctionGiveup.addEventListener("click", () => {
    const status = document.getElementById("auction-status");
    const result = document.getElementById("auction-result");
    if (!status || !result) return;

    // 完全没出价就认输
    if (auctionYourBid === 0 && auctionStrongBid === 0) {
      status.innerHTML = "你选择认输，但其实你还没真正出过价。";
      result.innerHTML = `
          最终结果：<br />
          · 你支付：<span class="highlight">0</span> 元，什么也没拿到；<br />
          · 神秘强者也没有出价，购物卡仍然在商家手里。<br /><br />
          评价：你是那种看到标题就点右上角的人，既没赚钱，也没亏钱。`;
      return;
    }

    // 你 0，对方 >0（你一直旁观）
    if (auctionYourBid === 0 && auctionStrongBid > 0) {
      const oppNet = auctionStrongBid - auctionValue;
      status.innerHTML = `
          最终结果：<br />
          · 你支付：<span class="highlight">0</span> 元；<br />
          · 神秘强者支付：<span class="highlight">${auctionStrongBid}</span> 元，拿到 10 元购物卡。`;
      result.innerHTML = `
          对方的净结果：${auctionStrongBid} - 10 = <span class="highlight">${oppNet}</span> 元。<br />
          评价：你在旁边看了一场“用小钱换大钱”的奇怪拍卖，自己没被卷进去，还算理智。`;
      return;
    }

    // 一般情况：你出过价，对方一直跟到你+1
    const yourPay = auctionYourBid;
    const oppPay = auctionStrongBid;
    const yourNet = -yourPay;
    const oppNet = oppPay - auctionValue;

    status.innerHTML = `
        拍卖结束：<br />
        · 你最高出价：<span class="highlight">${yourPay}</span> 元，最终一无所获；<br />
        · 神秘强者最高出价：<span class="highlight">${oppPay}</span> 元，拿到 10 元购物卡。`;

    let comment = "";
    if (yourPay <= 10) {
      comment = `你名义上只亏了 <span class="highlight">${-yourNet}</span> 元，还算浅尝辄止。`;
    } else if (yourPay <= 20) {
      comment = `你为了 10 元卡，愿意掏出 <span class="highlight">${yourPay}</span> 元，净亏 <span class="highlight">${-yourNet}</span> 元。情绪已经明显接管钱包。`;
    } else {
      comment = `你把一场 10 元的拍卖，玩成了几十元的情绪充值，净亏 <span class="highlight">${-yourNet}</span> 元。`;
    }

    result.innerHTML = `
        从账面来看：<br />
        · 你的净结果：<span class="highlight">${yourNet}</span> 元；<br />
        · 神秘强者的净结果：<span class="highlight">${oppNet}</span> 元。<br /><br />
        ${comment}<br /><br />
        总结：所谓“陷阱拍卖”，就是用一个小小的标的，慢慢把人锁进“再加一点就不亏”的循环里，<br />
        直到大家一起发现——原来真正被拍卖的是理智。`;
  });
}

// =================== 分赃后的豪赌（三色珠子） ===================

const btnGambleStart = document.getElementById("btn-gamble-start");
if (btnGambleStart) {
  btnGambleStart.addEventListener("click", () => {
    resetGambleGame();
    showScreen("screen-gamble-game");
  });
}

const btnGamblePlay = document.getElementById("btn-gamble-play");
if (btnGamblePlay) {
  btnGamblePlay.addEventListener("click", () => {
    playOneGambleRound();
  });
}

const btnGambleReset = document.getElementById("btn-gamble-reset");
if (btnGambleReset) {
  btnGambleReset.addEventListener("click", () => {
    resetGambleGame();
  });
}
