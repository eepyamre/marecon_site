const dateend = 1708111800000;
const dates = document.querySelectorAll('.schedule-page .col > p')
const d = new Date(dateend)
const dateStart = d.getDate()
if(dateStart !== 16){
  dates.forEach((p, i) => {
    p.textContent = dateStart + i + ' feb'
  })
}
const unixToDays = (timeDifference) => {
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  return [days, hours, minutes, seconds];
};

const convertToUserLocalTime = (timeString) => {
  const inputTime = new Date(timeString);

  const userLocalTime = inputTime.toLocaleString(undefined, {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  });

  const offset = Math.floor(-new Date().getTimezoneOffset() / 60)
  
  return userLocalTime + ' GMT'+ (offset > 0 ? '+' : '') + offset;
}

addEventListener("DOMContentLoaded", () => {
  const pages = {
    "#/": {
      bodyClass: "has-background_1",
      el: document.querySelector(".countdown-page"),
    },
    "#/schedule": {
      bodyClass: "has-background_2",
      el: document.querySelector(".schedule-page"),
    },
    "#/vendors": {
      bodyClass: "has-background_3",
      el: document.querySelector(".vendors-page"),
    },
    "#/faq": {
      bodyClass: "has-background_2",
      el: document.querySelector(".faq-page"),
    },
  };
  const days = document.querySelector("#days");
  const hours = document.querySelector("#hours");
  const min = document.querySelector("#min");
  const sec = document.querySelector("#sec");
  const countdownH1 = document.querySelector(".countdown h1");
  countdownH1.classList.add("hidden");
  const interval = setInterval(() => {
    const ms = dateend - Date.now();
    if (ms <= 0) {
      countdownH1.classList.remove("hidden");
      clearInterval(interval);
      days.parentElement.classList.add("hidden");
      hours.parentElement.classList.add("hidden");
      min.parentElement.classList.add("hidden");
      sec.parentElement.classList.add("hidden");
      return;
    }
    [days.textContent, hours.textContent, min.textContent, sec.textContent] =
      unixToDays(ms);
  }, 1000);
  Object.values(pages).forEach((item) => item.el.classList.add("hidden"));
  const switchPage = () => {
    Object.values(pages).forEach((item) => item.el.classList.add("hidden"));
    document.body.classList.remove(
      "has-background_1",
      "has-background_2",
      "has-background_3"
    );
    if (pages[location.hash]) {
      pages[location.hash].el.classList.remove("hidden");
      document.body.classList.add(pages[location.hash].bodyClass);
    } else {
      pages["#/"].el.classList.remove("hidden");
      document.body.classList.add(pages["#/"].bodyClass);
    }
  };
  addEventListener("hashchange", () => {
    switchPage();
  });
  switchPage();
  
  const cardTimes = document.querySelectorAll('.schedule-page .card p:nth-of-type(2)')
  cardTimes.forEach(item => {
    const cardTimesSplitted = item.textContent.split(' | ')
    cardTimesSplitted[0] = convertToUserLocalTime('01/01/24 ' + cardTimesSplitted[0])
    item.textContent = cardTimesSplitted[0] + ' | ' + cardTimesSplitted[1]
  })
  
  const vendorsCards = document.querySelectorAll('.vendors-page .card')
  vendorsCards.forEach(card => {
    const images   = card.querySelector('.images')
    const controls = card.querySelector('.controls')
    
    if(images){
      let i = 0;
      controls.children[1].addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        i += 1;
        if(i === images.children.length){
          i = 0
        }
        images.style.transform = `translateX(-${(100 * i) / images.children.length}%)`
      })
      controls.children[0].addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        i -= 1;
        if(i < 0){
          i = images.children.length - 1
        }
        images.style.transform = `translateX(-${(100 * i) / images.children.length}%)`
      })
    }
  })
});
