
const text =document.querySelector('.text p');
text.innerHTML = text.textContent.split('').map(
  (char,i)=>`<span style="transform:rotate(${i*8.3}deg);">${char}</span> `
).join('');


const navLinks = document.querySelectorAll('.navlink');
const sections = document.querySelectorAll('.section');
let activeSection = 'home';
window.addEventListener('scroll',()=>{

  sections.forEach(element => {
    if(window.scrollY >= (element.offsetTop-element.clientHeight/2)){
      activeSection = element.id
    }
  });

  navLinks.forEach(link=>{
    if(link.href.includes(activeSection)){
      document.querySelector('.active-nav').classList.remove('active-nav');
      link.classList.add('active-nav')
    }
  })


});
