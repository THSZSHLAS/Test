// 可配置：左右底部图片数量（根据你实际有多少张自己改）
const LEFT_IMAGE_COUNT = 3;   // 对应 pic_L1.png ~ pic_L3.png
const RIGHT_IMAGE_COUNT = 3;  // 对应 pic_R1.png ~ pic_R3.png
const BOTTOM_IMAGE_COUNT = 3; // 对应 pic_B1.png ~ pic_B3.png

// 目前启用的试炼（之后实现海盗分金、囚徒困境、陷阱拍卖时，把它们加进来）
const ENABLED_TRIALS = ["magic"]; // 未来可以改成 ["magic", "pirate", "prisoner", "auction"]

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

// 刷新左上 / 右上 / 底部图片
function updateDecorImages() {
  const left = document.getElementById("img-left");
  const right = document.getElementById("img-right");
  const bottom = document.getElementById("img-bottom");

  if (left && LEFT_IMAGE_COUNT > 0) {
    const idx = randInt(LEFT_IMAGE_COUNT);
    left.src = `pic_L${idx}.png`;
  }

  if (right && RIGHT_IMAGE_COUNT > 0) {
    const idx = randInt(RIGHT_IMAGE_COUNT);
    right.src = `pic_R${idx}.png`;
  }

  if (bottom && BOTTOM_IMAGE_COUNT > 0) {
    const idx = randInt(BOTTOM_IMAGE_COUNT);
    bottom.src = `pic_B${idx}.png`;
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
      // 从已启用的试炼中随机选一个
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

  // 所有 data-goto 按钮：通用页面跳转
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
});
