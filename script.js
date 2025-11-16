// 图片数量配置（和你真实素材数量一致）
const LEFT_IMAGE_COUNT = 2;   // pic_L1.png ~ pic_L2.png
const RIGHT_IMAGE_COUNT = 2;  // pic_R1.png ~ pic_R2.png
const BOTTOM_IMAGE_COUNT = 3; // pic_B1.png ~ pic_B3.png

// 已启用的试炼：主页随机从这四个里跳
const ENABLED_TRIALS = ["magic", "pirate", "prisoner", "auction"];

// 工具：切换页面时顺便刷新装饰图
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  updateDecorImages();
}

// 工具：随机 1~max
function randInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

// 如果图片抽到不存在的，兜底回到 1 号图
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

// 随机 1-100（故事魔杖用）
function roll100() {
  return Math.floor(Math.random() * 100) + 1;
}

document.addEventListener("DOMContentLoaded", () => {
  // 初始刷新图片
  updateDecorImages();

  // 主页开始按钮：随机进入四个试炼之一
  const mainStartBtn = document.getElementById("btn-main-start");
  if (mainStartBtn) {
    mainStartBtn.addEventListener("click", () => {
      const trial =
        ENABLED_TRIALS[Math.floor(Math.random() * ENABLED_TRIALS.length)];
      if (trial === "magic") {
        showScreen("screen-magic-intro");
      } else if (trial === "pirate") {
        showScreen("screen-pirate-intro");
      } else if (trial === "prisoner") {
        showScreen("screen-prisoner-intro");
      } else if (trial === "auction") {
        showScreen("screen-auction-intro");
      }
    });
  }

  // 魔法试炼简介 -> 选择武器
  const magicStartBtn = document.getElementById("btn-magic-start");
  if (magicStartBtn) {
    magicStartBtn.addEventListener("click", () => {
      showScreen("screen-weapon");
    });
  }

  // 海盗分金：简介 -> 输入方案
  const pirateStartBtn = document.getElementById("btn-pirate-start");
  if (pirateStartBtn) {
    pirateStartBtn.addEventListener("click", () => {
      const input = document.getElementById("pirate-input");
      const result = document.getElementById("pirate-result");
      if (input) input.value = "";
      if (result) result.textContent = "";
      showScreen("screen-pirate-game");
    });
  }

  // 囚徒困境：简介 -> 模式选择
  const prisonerStartBtn = document.getElementById("btn-prisoner-start");
  if (prisonerStartBtn) {
    prisonerStartBtn.addEventListener("click", () => {
      showScreen("screen-prisoner-mode");
    });
  }

  // 通用 data-goto 页面跳转
  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-goto");
      if (targetId) showScreen(targetId);
    });
  });

  // 魔法试炼：选择武器
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

  // 高之魅惑：选择目标
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

  // 故事魔杖：先控野猪王（X = 30）
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
        运气不好，还不动脑。下次可以换条路走走。`;
      }
    });
  }

  // 故事魔杖：先控空调大王（X = 38）
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
        暂时既不是智将，也不是脸帝。再来一把？`;
      }
    });
  }

  // 故事魔杖：空放策略（X = 60）
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
        策略是对的，这把纯属脸黑。再 roll 一次问题不大。`;
      }
    });
  }

  // ==========================
  // 海盗分金：提交方案逻辑
  // ==========================
  const btnPirateSubmit = document.getElementById("btn-pirate-submit");
  if (btnPirateSubmit) {
    btnPirateSubmit.addEventListener("click", () => {
      const inputEl = document.getElementById("pirate-input");
      const resultEl = document.getElementById("pirate-result");
      if (!inputEl || !resultEl) return;

      const raw = inputEl.value.trim();
      if (!raw) {
        resultEl.innerHTML =
          '至少先写点什么吧。<br />格式示例：<code>98,0,1,0,1</code>';
        return;
      }

      const parts = raw.replace(/，/g, ",").split(",");
      if (parts.length !== 5) {
        resultEl.innerHTML =
          "需要刚好 5 个数字，用英文逗号隔开。<br />例如：<code>98,0,1,0,1</code>";
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

      // 正确答案：你, Jack, 雍, 高, 西 = 98,0,1,0,1
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

      // 1. 暴力自肥型：你≥90，雍和西都是 0
      if (you >= 90 && yong === 0 && xi === 0) {
        resultEl.innerHTML = `
          ❌ 暴力自肥型。<br />
          你给自己塞了 <span class="highlight">${you}</span> 枚金币，雍和西一毛没有。<br />
          他们当然希望你被撞飞，下一轮说不定自己就能当老大。<br />
          评价：你把别人都当傻子，结果被制度当成了傻子。`;
        return;
      }

      // 2. 好兄弟平分型：五个人差不多一样多
      const maxCoin = Math.max(...nums);
      const minCoin = Math.min(...nums);
      if (maxCoin - minCoin <= 10) {
        resultEl.innerHTML = `
          ❌ 好兄弟公平分型。<br />
          你这方案基本是“兄弟齐心，其利断金，先别管我是不是要被撞飞”。<br />
          作为 1 号老大，既没多拿钱，也没稳住自己的票。<br />
          评价：适合当团建负责人，不太适合当海盗头子。`;
        return;
      }

      // 3. 慈善家型：有人拿得比你多
      const othersMax = Math.max(jack, yong, gao, xi);
      if (othersMax > you) {
        resultEl.innerHTML = `
          ❌ 慈善家型。<br />
          有人拿的比你多：<span class="highlight">${othersMax}</span> &gt; 你的 <span class="highlight">${you}</span>。<br />
          你是出方案的人，不是来给队友发年终奖的金主爸爸。<br />
          评价：你适合写分赃协议书，但名字写错了，应该写在“最底下一行”。`;
        return;
      }

      // 4. 贿赂错人型：买 Jack 或高，放弃雍和西
      if ((jack > 0 || gao > 0) && yong === 0 && xi === 0) {
        resultEl.innerHTML = `
          ❌ 贿赂错人型。<br />
          你花金币去买 Jack 或高，却把雍和西晾在一边。<br />
          在标准 5 海盗局面里，真正好买的是雍和西，你现在是拿钱砸那些本来就不太想帮你的人。<br />
          评价：钱花出去了，票没买到。经典“冤大头”操作。`;
        return;
      }

      // 兜底嘲讽
      resultEl.innerHTML = `
        ❌ 分配方案没命中任何已知策略。<br />
        我都没预测到还有这种分法。<br />
        评价：恭喜你，首创<span class="highlight">海盗界新型呆子分配方法</span>。<br />
        建议：多想想“谁在后续局面里最惨”，他们才是最好买的票。`;
    });
  }

  // =================================
  // 囚徒困境：一次性 & 三轮逻辑
  // =================================
  // 一次性：选择按钮
  document
    .querySelectorAll("#screen-prisoner-one-shot [data-prison-one-choice]")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-prison-one-choice");
        // 神秘强者在一次性局里直接选择坦白
        if (choice === "silent") {
          showScreen("screen-prisoner-one-result-CS");
        } else {
          showScreen("screen-prisoner-one-result-CC");
        }
      });
    });

  // 一次性结果页跳三轮
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

  // 三轮审讯状态
  let prisonHistory = [];
  let prisonTotalYou = 0;
  let prisonTotalStrong = 0;

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

  function prisonStrongChoice(round) {
    if (round === 1) return "silent"; // 第 1 轮先给合作机会
    if (prisonHistory.length === 0) return "silent";
    return prisonHistory[prisonHistory.length - 1].you; // 之后复制你的上一次选择
  }

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

  // 模式选择页：三轮审讯按钮
  const btnPrisonerRepeated = document.getElementById("btn-prisoner-repeated");
  if (btnPrisonerRepeated) {
    btnPrisonerRepeated.addEventListener("click", () => {
      resetPrisonRepeated();
      showScreen("screen-prisoner-r1");
    });
  }

  // 三轮审讯：每轮选择
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

  // 三轮总结页：再来一次
  const btnPrisonerRestartRepeated = document.getElementById(
    "btn-prisoner-restart-repeated"
  );
  if (btnPrisonerRestartRepeated) {
    btnPrisonerRestartRepeated.addEventListener("click", () => {
      resetPrisonRepeated();
      showScreen("screen-prisoner-r1");
    });
  }

  // ======================
  // 陷阱拍卖：多轮出价
  // ======================
  const auctionValue = 10;
  let auctionYourBid = 0;
  let auctionStrongBid = 0;

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

      // 首轮不出价：旁观模式
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

      // 有效新出价：对手自动出价 X+1
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

      // 你 0，对方 >0（旁观模式结束）
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

      // 一般情况：你出过价，对方始终跟到你 +1，你认输
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
});
