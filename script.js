// 可配置：左右底部图片数量（和你实际素材数量一致）
const LEFT_IMAGE_COUNT = 2;   // pic_L1.png ~ pic_L2.png
const RIGHT_IMAGE_COUNT = 2;  // pic_R1.png ~ pic_R2.png
const BOTTOM_IMAGE_COUNT = 3; // pic_B1.png ~ pic_B3.png

// 已启用的试炼
const ENABLED_TRIALS = ["magic", "pirate"]; 
// 之后可以扩展成 ["magic", "pirate", "prisoner", "auction"]

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

// 如果图片抽到不存在的，兜底回到 1 号图（更稳一点）
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
  // 一开始刷新一次图片
  updateDecorImages();

  // 顶层首页：开始试炼按钮
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

  // 海盗分金：简介 -> 游戏页面
  const pirateStartBtn = document.getElementById("btn-pirate-start");
  if (pirateStartBtn) {
    pirateStartBtn.addEventListener("click", () => {
      // 清空输入和结果
      const input = document.getElementById("pirate-input");
      const result = document.getElementById("pirate-result");
      if (input) input.value = "";
      if (result) result.textContent = "";
      showScreen("screen-pirate-game");
    });
  }

  // 通用 data-goto 页面跳转
  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-goto");
      if (targetId) showScreen(targetId);
    });
  });

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
      const X = 30; // 约 30% 胜率
      const el = document.getElementById("story-boar-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        这把你靠着<span class="highlight">运气 + 一点点脑子</span>赢了野猪王和空调大王。`;
      } else {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        运气不好，还不动脑。<br />
        提示：这条线本来胜率就不高，下次可以试试别的策略。`;
      }
    });
  }

  // 故事魔杖：先控空调大王（X ≈ 38）
  const btnAcRoll = document.getElementById("btn-story-ac-roll");
  if (btnAcRoll) {
    btnAcRoll.addEventListener("click", () => {
      const roll = roll100();
      const X = 38; // 约 38% 胜率
      const el = document.getElementById("story-ac-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        你先控住空调大王，再和野猪王缠斗，最后居然赢了。<br />
        评价：<span class="highlight">算是走在正确方向上的策略。</span>`;
      } else {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        这把没赢说明你既没有成为神秘强者，也暂时不是运气之子。<br />
        建议：可以试试空放那条更抽象但更优的路线。`;
      }
    });
  }

  // 故事魔杖：空放策略（X = 60）
  const btnPassRoll = document.getElementById("btn-story-pass-roll");
  if (btnPassRoll) {
    btnPassRoll.addEventListener("click", () => {
      const roll = roll100();
      const X = 60; // 理论最优胜率
      const el = document.getElementById("story-pass-result");
      if (!el) return;
      if (roll <= X) {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        你第一轮空放，让野猪王和空调大王互相伤害，最后用故事魔杖收割战场。<br />
        评价：<span class="highlight">抽象，但确实是最优策略，执行到位，干得漂亮。</span>`;
      } else {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        虽然这把输了，但这是<span class="highlight">理论上胜率最高的策略</span>。<br />
        评价：不错，至少思路是对的，再来一把就当刷脸。`;
      }
    });
  }

  // ========================
  // 海盗分金：提交方案逻辑
  // ========================
  const btnPirateSubmit = document.getElementById("btn-pirate-submit");
  if (btnPirateSubmit) {
    btnPirateSubmit.addEventListener("click", () => {
      const inputEl = document.getElementById("pirate-input");
      const resultEl = document.getElementById("pirate-result");
      if (!inputEl || !resultEl) return;

      const raw = inputEl.value.trim();
      if (!raw) {
        resultEl.innerHTML =
          '至少先写点什么吧？<br />提示：格式类似 <code>98,0,1,0,1</code>';
        return;
      }

      // 支持中文逗号
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
          resultEl.innerHTML =
            "你的输入里有不是整数的东西。<br />建议先学会数数，再来当海盗。";
          return;
        }
        if (n < 0) {
          resultEl.innerHTML =
            "还想给别人负金币？这叫金融诈骗，不叫分赃。";
          return;
        }
        nums.push(n);
      }

      const [you, jack, yong, gao, xi] = nums;
      const sum = nums.reduce((a, b) => a + b, 0);

      if (sum !== 100) {
        resultEl.innerHTML = `你这五个数加起来是 <span class="highlight">${sum}</span>，不是 100。<br />
        连总数都没数清楚，就想指挥分赃？特斯拉已经在热车了。`;
        return;
      }

      // 正确答案：经典 5 海盗解：1 号 98、3 号 1、5 号 1
      // 对应顺序【你, Jack, 雍, 高, 西】= [98,0,1,0,1]
      if (
        you === 98 &&
        jack === 0 &&
        yong === 1 &&
        gao === 0 &&
        xi === 1
      ) {
        resultEl.innerHTML = `
          ✅ <span class="highlight">通关！</span><br />
          你给自己 <span class="highlight">98</span>，只用用 1 枚金币收买雍、1 枚收买西，刚好凑够 3 票通过。<br />
          · 如果你挂了，后三人的博弈里，雍和西在后续局面里其实拿不到比 0 更好的东西，<br />
          &nbsp;&nbsp;所以你给他们 1，他们就有动力投你赞成票。<br />
          · Jack 和 高在后续局面里还能混点钱，所以你完全不用买他们。<br />
          <br />
          评价：你是真懂博弈，不是来做公益的海盗。`;
        return;
      }

      // ==============
      // 四类常见错误
      // ==============

      // 1. 暴力自肥型：你拿 >=90，且没给关键票（雍、 西）任何东西
      if (you >= 90 && yong === 0 && xi === 0) {
        resultEl.innerHTML = `
          ❌ 暴力自肥型分配。<br />
          你给自己塞了 <span class="highlight">${you}</span> 枚金币，关键选票雍和西一分钱没有。<br />
          结果：他们当然希望你被特斯拉撞飞，<br />
          &nbsp;&nbsp;下一轮说不定他们自己就能当老大，拿得更多。<br />
          <br />
          评价：你把大家都当傻子，但博弈论告诉你——真正被教育的是你自己。`;
        return;
      }

      // 2. 大家平分好兄弟型：五个人差不多一样多
      const maxCoin = Math.max(...nums);
      const minCoin = Math.min(...nums);
      if (maxCoin - minCoin <= 10) {
        resultEl.innerHTML = `
          ❌ 好兄弟公平分型。<br />
          你这分配基本是“社会主义试验田”：每个人差不多都是 ${minCoin}~${maxCoin}。<br />
          问题是：你是 1 号老大，有话语权却没用出来，<span class="highlight">既没多拿钱，又没保证别人愿意保你</span>。<br />
          后面的海盗在后续局面里，很可能能拿到更多，自然不介意先把你送上特斯拉。<br />
          <br />
          评价：你适合当工会主席，不太适合当海盗老大。`;
        return;
      }

      // 3. 慈善家型：有人拿得比你多
      const othersMax = Math.max(jack, yong, gao, xi);
      if (othersMax > you) {
        resultEl.innerHTML = `
          ❌ 慈善家型分配。<br />
          有人拿的比你多：<span class="highlight">${othersMax}</span> &gt; 你的 <span class="highlight">${you}</span>。<br />
          作为 1 号海盗，你的目标是“<span class="highlight">在活着的前提下最大化自己</span>”，不是给队友发年终奖。<br />
          这样分下去，你既没拿到最多，又不一定能多出稳固的支持票。<br />
          <br />
          评价：你这是抢银行还是做公益？建议从“己利”这门课重修起。`;
        return;
      }

      // 4. 贿赂错人型：拼命讨好 Jack 或高，却放弃雍和西
      if ((jack > 0 || gao > 0) && yong === 0 && xi === 0) {
        resultEl.innerHTML = `
