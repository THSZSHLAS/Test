// 简单页面切换函数
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });
  const target = document.getElementById(id);
  if (target) target.classList.add("active");
}

// 随机 1-100
function roll100() {
  return Math.floor(Math.random() * 100) + 1;
}

document.addEventListener("DOMContentLoaded", () => {
  // 首页 -> 选择武器
  document.getElementById("btn-start").addEventListener("click", () => {
    showScreen("screen-weapon");
  });

  // 所有 data-goto 按钮：统一页面跳转
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
          showScreen("screen-tesla");
        } else if (weapon === "charm") {
          showScreen("screen-charm-choose");
        } else if (weapon === "story") {
          showScreen("screen-story-choose");
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
          // 先控野猪王
          showScreen("screen-story-boar");
          // 清空上次结果
          document.getElementById("story-boar-result").textContent = "";
        } else if (opt === "ac") {
          // 先控空调大王
          showScreen("screen-story-ac");
          document.getElementById("story-ac-result").textContent = "";
        } else if (opt === "pass") {
          // 空放策略
          showScreen("screen-story-pass");
          document.getElementById("story-pass-result").textContent = "";
        }
      });
    });

  // 故事魔杖：打野猪王的随机数（X = 30）
  document
    .getElementById("btn-story-boar-roll")
    .addEventListener("click", () => {
      const roll = roll100();
      const X = 30; // 大约 30% 的胜率
      const el = document.getElementById("story-boar-result");
      if (roll <= X) {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        这把你靠着<span class="highlight">运气 + 一点点脑子</span>赢了野猪王和空调大王。`;
      } else {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        运气不好，还不动脑。<br />
        提示：这条线本来胜率就不高，下次可以试试别的策略。`;
      }
    });

  // 故事魔杖：打空调大王的随机数（X ≈ 38）
  document
    .getElementById("btn-story-ac-roll")
    .addEventListener("click", () => {
      const roll = roll100();
      const X = 38; // 约 38%
      const el = document.getElementById("story-ac-result");
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

  // 故事魔杖：空放策略（X = 60）
  document
    .getElementById("btn-story-pass-roll")
    .addEventListener("click", () => {
      const roll = roll100();
      const X = 60; // 按你给的设定：60% 胜率
      const el = document.getElementById("story-pass-result");
      if (roll <= X) {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（≤ ${X}）<br />
        你第一轮空放，让野猪王和空调大王互相伤害，最后你用故事魔杖收割战场。<br />
        评价：<span class="highlight">抽象，但确实是最优策略。执行到位，干得漂亮。</span>`;
      } else {
        el.innerHTML = `随机数：<span class="highlight">${roll}</span>（> ${X}）<br />
        虽然这把输了，但这是<span class="highlight">理论上胜率最高的策略</span>。<br />
        评价：不错，至少思路是对的，再来一把就当刷脸。`;
      }
    });
});
