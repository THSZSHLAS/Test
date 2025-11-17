// 神秘强者试炼场 交互脚本

const BEAD_GAME_COST = 5; // 每局成本 5 元
let beadRoundCount = 0;
let beadHistory = [];

// 拍卖用
const AUCTION_VALUE = 10;

// 工具函数：显示某个 screen
function showScreen(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// 工具函数：1..max 的随机整数
function randInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

// 工具函数：1..100 的随机整数
function roll100() {
  return randInt(100);
}

/* ============= 三色珠子 · 分赃后的豪赌 ============= */

function resetBeadGame() {
  beadRoundCount = 0;
  beadHistory = [];
  const last = document.getElementById("bead-last-result");
  const summary = document.getElementById("bead-summary");
  const history = document.getElementById("bead-history");
  if (last) last.innerHTML = "还没开始抽珠子，先来一局试试？";
  if (summary) summary.innerHTML = "";
  if (history) history.innerHTML = "";
}

// 从 24 颗珠子中无放回抽取 12 颗：红 / 黄 / 蓝各 8 颗
function drawBeadsOnce() {
  const bag = [];
  for (let i = 0; i < 8; i++) {
    bag.push("R", "Y", "B");
  }
  let r = 0,
    y = 0,
    b = 0;
  for (let k = 0; k < 12; k++) {
    const idx = Math.floor(Math.random() * bag.length);
    const c = bag.splice(idx, 1)[0];
    if (c === "R") r++;
    else if (c === "Y") y++;
    else b++;
  }
  return { r, y, b };
}

// 根据颜色数量决定奖项 & 奖励金额
function beadRewardForCounts(r, y, b) {
  const sorted = [r, y, b].sort((a, b) => b - a);
  const pattern = `${sorted[0]}${sorted[1]}${sorted[2]}`;

  // 头等奖：840
  if (pattern === "840") {
    return { level: "头等奖", reward: 20, pattern };
  }

  // 回血局：543
  if (pattern === "543") {
    return { level: "回血局", reward: 10, pattern };
  }

  const highest = sorted[0];
  let level;
  let reward;

  // 好运奖：极偏色 7 开头（831、750 等）
  if (highest >= 7) {
    level = "好运奖";
    reward = 10 + randInt(10) - 1; // 10–19
  } else if (highest === 6) {
    // 安慰奖：6 开头（642、633 等）
    level = "安慰奖";
    reward = 5 + randInt(5) - 1; // 5–9
  } else {
    // 普通奖：剩下情况，通常是小亏
    level = "普通奖";
    reward = randInt(4); // 1–4
  }

  return { level, reward, pattern };
}

function playBeadRound() {
  const last = document.getElementById("bead-last-result");
  const summary = document.getElementById("bead-summary");
  const historyEl = document.getElementById("bead-history");
  if (!last || !summary || !historyEl) return;

  const { r, y, b } = drawBeadsOnce();
  const info = beadRewardForCounts(r, y, b);
  const net = info.reward - BEAD_GAME_COST;

  beadRoundCount++;
  const record = {
    round: beadRoundCount,
    red: r,
    yellow: y,
    blue: b,
    pattern: info.pattern,
    level: info.level,
    reward: info.reward,
    net,
  };
  beadHistory.push(record);

  const netStr = net >= 0 ? `+${net}` : `${net}`;

  last.innerHTML = `
第 ${record.round} 局：
<br>抽到 红 ${record.red} / 黄 ${record.yellow} / 蓝 ${record.blue}（按数量排序为 ${record.pattern}）
<br><span class="highlight">${record.level}</span>：奖励 ${record.reward} 元，本局净收益 ${netStr} 元。
`;

  let totalReward = 0;
  let totalNet = 0;
  beadHistory.forEach((r) => {
    totalReward += r.reward;
    totalNet += r.net;
  });
  const totalNetStr = totalNet >= 0 ? `+${totalNet}` : `${totalNet}`;

  let msg = `已玩 ${beadRoundCount} 局，总奖励 ${totalReward} 元；总净收益 ${totalNetStr} 元。`;
  if (beadRoundCount >= 10) {
    msg += `<br>✅ 已满足“至少 10 局”条件，请截图找开发者 ${
      totalNet >= 0 ? "领奖" : "要回血"
    }。<br><span class="taunt">（输了不截图，特斯拉就要出发咯～）</span>`;
  } else {
    msg += `<br>再玩 ${10 - beadRoundCount} 局就可以截图结算了。`;
  }
  summary.innerHTML = msg;

  let historyHtml = "<strong>历史记录：</strong><br>";
  beadHistory.forEach((r) => {
    const nStr = r.net >= 0 ? `+${r.net}` : `${r.net}`;
    historyHtml += `第 ${r.round} 局：红${r.red} 黄${r.yellow} 蓝${r.blue} → ${
      r.level
    }，奖励 ${r.reward} 元，净收益 ${nStr} 元。<br>`;
  });
  historyEl.innerHTML = historyHtml;
}

/* ============= 陷阱拍卖 ============= */

let auctionYourBid = 0;
let auctionStrongBid = 0;

function resetAuction() {
  auctionYourBid = 0;
  auctionStrongBid = 0;
  const status = document.getElementById("auction-status");
  const res = document.getElementById("auction-result");
  const input = document.getElementById("auction-input");
  if (input) input.value = "5";
  if (status) {
    status.innerHTML =
      '提示：从期望值看，这类拍卖<b>几乎必亏</b>，欢迎用钱包验证。';
  }
  if (res) res.innerHTML = "";
}

/* ============= 事件绑定 ============= */

document.addEventListener("DOMContentLoaded", () => {
  // 首页按钮：进入试炼菜单
  const mainStartBtn = document.getElementById("btn-main-start");
  if (mainStartBtn) {
    mainStartBtn.addEventListener("click", () => {
      showScreen("screen-trial-menu");
    });
  }

  // 通用 data-goto 跳转
  document.body.addEventListener("click", (e) => {
    const target = e.target.closest("[data-goto]");
    if (!target) return;
    const id = target.getAttribute("data-goto");
    if (id) showScreen(id);
  });

  /* ===== 魔法试炼：三个随机故事，一旦失败就送回首页 ===== */

  const btnBoarRoll = document.getElementById("btn-story-boar-roll");
  if (btnBoarRoll) {
    btnBoarRoll.addEventListener("click", () => {
      const roll = roll100();
      const X = 30;
      const el = document.getElementById("story-boar-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：${roll}（≤ ${X}）<br>
这把你靠着 <span class="highlight">运气 + 一点点脑子</span> 赢了野猪王和小弟。`;
      } else {
        el.innerHTML = `随机数：${roll}（> ${X}）<br>
运气不好，还不动脑。下次可以换条路走走。<br><br>
系统：随机数翻车，已自动送你回主页面重新做人。`;
        setTimeout(() => {
          showScreen("screen-home");
        }, 1500);
      }
    });
  }

  const btnAcRoll = document.getElementById("btn-story-ac-roll");
  if (btnAcRoll) {
    btnAcRoll.addEventListener("click", () => {
      const roll = roll100();
      const X = 40;
      const el = document.getElementById("story-ac-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：${roll}（≤ ${X}）<br>
你精准控住空调大王，全场温度被你拿捏得死死的。`;
      } else {
        el.innerHTML = `随机数：${roll}（> ${X}）<br>
暂时既不是智将，也不是脸帝。<br>
空调大王反手把你冻回了主菜单。`;
        setTimeout(() => {
          showScreen("screen-home");
        }, 1500);
      }
    });
  }

  const btnPassRoll = document.getElementById("btn-story-pass-roll");
  if (btnPassRoll) {
    btnPassRoll.addEventListener("click", () => {
      const roll = roll100();
      const X = 50;
      const el = document.getElementById("story-pass-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：${roll}（≤ ${X}）<br>
你用一动不动的心态赢下了这局，<span class="highlight">不战而屈人之兵</span>。`;
      } else {
        el.innerHTML = `随机数：${roll}（> ${X}）<br>
策略是对的，这把纯属脸黑。<br><br>
系统：不过这局算你输，先送你回主页面。`;
        setTimeout(() => {
          showScreen("screen-home");
        }, 1500);
      }
    });
  }

  /* ===== 海盗分金 ===== */

  const btnPirateSubmit = document.getElementById("btn-pirate-submit");
  if (btnPirateSubmit) {
    btnPirateSubmit.addEventListener("click", () => {
      const input = document.getElementById("pirate-offer");
      const res = document.getElementById("pirate-result");
      if (!input || !res) return;

      const offer = Number(input.value);
      if (Number.isNaN(offer) || offer < 0 || offer > 100) {
        res.innerHTML = "请输入 0–100 之间的整数金币数。";
        return;
      }

      const minAccept = 20 + randInt(21) - 1; // 20–40
      if (offer >= minAccept) {
        const youGet = 100 - offer;
        res.innerHTML = `
同伙的心理底线是：${minAccept} 枚金币。<br>
你给了他 ${offer} 枚，他勉强点头同意。<br>
你拿到 <span class="highlight">${youGet} 枚金币</span>，这次算是稳中求胜。`;
      } else {
        res.innerHTML = `
同伙的心理底线是：${minAccept} 枚金币。<br>
你只给了他 ${offer} 枚，他直接把你扔下船。<br>
<span class="taunt">结果：你 0 枚金币，他抱着箱子跑路。</span>`;
      }
    });
  }

  /* ===== 囚徒困境 ===== */

  function playPrisonerGame(yourChoice) {
    const otherChoice = Math.random() < 0.5 ? "C" : "D"; // C: 沉默, D: 举报
    const res = document.getElementById("prisoner-result");
    if (!res) return;

    let youYears, otherYears;
    if (yourChoice === "C" && otherChoice === "C") {
      youYears = 1;
      otherYears = 1;
    } else if (yourChoice === "D" && otherChoice === "D") {
      youYears = 5;
      otherYears = 5;
    } else if (yourChoice === "D" && otherChoice === "C") {
      youYears = 0;
      otherYears = 10;
    } else if (yourChoice === "C" && otherChoice === "D") {
      youYears = 10;
      otherYears = 0;
    }

    const yourText = yourChoice === "C" ? "沉默（合作）" : "举报（背刺）";
    const otherText = otherChoice === "C" ? "沉默" : "举报";

    res.innerHTML = `
你选择：<span class="highlight">${yourText}</span>；同伙选择：<span class="highlight">${otherText}</span>。<br>
你被判 <b>${youYears}</b> 年，他被判 <b>${otherYears}</b> 年。<br>
可以多玩几次，感受一下“理性自利”带来的集体毒打。`;
  }

  const btnPrisonerC = document.getElementById("btn-prisoner-cooperate");
  if (btnPrisonerC) {
    btnPrisonerC.addEventListener("click", () => playPrisonerGame("C"));
  }

  const btnPrisonerD = document.getElementById("btn-prisoner-defect");
  if (btnPrisonerD) {
    btnPrisonerD.addEventListener("click", () => playPrisonerGame("D"));
  }

  /* ===== 陷阱拍卖 ===== */

  const btnAuctionSubmit = document.getElementById("btn-auction-submit");
  if (btnAuctionSubmit) {
    btnAuctionSubmit.addEventListener("click", () => {
      const input = document.getElementById("auction-input");
      const status = document.getElementById("auction-status");
      const res = document.getElementById("auction-result");
      if (!input || !status || !res) return;

      const bid = Number(input.value);
      if (Number.isNaN(bid) || bid < 0 || bid > 20) {
        res.innerHTML = "请输入 0–20 之间的出价。";
        return;
      }

      auctionYourBid = bid;

      // 强者玩家出价：围绕你出价稍微偏高一点随机
      const minStrong = Math.max(0, bid - 2);
      const maxStrong = Math.min(20, bid + 4);
      auctionStrongBid =
        minStrong + Math.floor(Math.random() * (maxStrong - minStrong + 1));

      let youGain, strongGain, resultText;
      if (auctionYourBid > auctionStrongBid) {
        youGain = AUCTION_VALUE - auctionYourBid;
        strongGain = -auctionStrongBid;
        resultText = `你是最高出价者，拿到了 10 元优惠券。`;
      } else if (auctionYourBid < auctionStrongBid) {
        youGain = -auctionYourBid;
        strongGain = AUCTION_VALUE - auctionStrongBid;
        resultText = `强者玩家出价更高，拿到了 10 元优惠券。`;
      } else {
        // 平局：随便给强者
        youGain = -auctionYourBid;
        strongGain = AUCTION_VALUE - auctionStrongBid;
        resultText = `你们平价，但系统偏向强者玩家，他拿到了优惠券。`;
      }

      const youStr = youGain >= 0 ? `+${youGain}` : `${youGain}`;
      const strongStr = strongGain >= 0 ? `+${strongGain}` : `${strongGain}`;

      status.innerHTML = `你出了 <b>${auctionYourBid} 元</b>，强者出了 <b>${auctionStrongBid} 元</b>。`;
      res.innerHTML = `
${resultText}<br>
你本轮净收益：<span class="highlight">${youStr} 元</span>；强者本轮净收益：${strongStr} 元。<br>
多试几次，你会发现：<span class="taunt">大家为了不输给对方，最后一起输给规则。</span>`;
    });
  }

  const btnAuctionGiveup = document.getElementById("btn-auction-giveup");
  if (btnAuctionGiveup) {
    btnAuctionGiveup.addEventListener("click", () => {
      resetAuction();
    });
  }

  /* ===== 分赃后的豪赌：按钮绑定 ===== */

  const btnBeadStart = document.getElementById("btn-bead-start");
  if (btnBeadStart) {
    btnBeadStart.addEventListener("click", () => {
      resetBeadGame();
      showScreen("screen-gamble-game");
    });
  }

  const btnBeadPlay = document.getElementById("btn-bead-play");
  if (btnBeadPlay) {
    btnBeadPlay.addEventListener("click", () => {
      playBeadRound();
    });
  }

  // 初始状态：显示首页
  showScreen("screen-home");
});
