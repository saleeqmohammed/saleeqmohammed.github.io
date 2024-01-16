
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

function menuClose(params) {
  document.querySelector('.menu').style.display = 'none';
  document.querySelector('.blur-background').style.opacity = 0;
  document.querySelector('.open-menu').style.display = 'block';
  document.querySelector('.close-menu').style.display = 'none';
  
}

let responsiveMenuCheck = document.getElementById('menu-check');
responsiveMenuCheck.addEventListener('change',()=>{
  if (responsiveMenuCheck.checked){
    document.querySelector('.menu').style.display = 'block';
    document.querySelector('.close-menu').style.display = 'block';
    document.querySelector('.blur-background').style.opacity = 1;
    document.querySelector('.open-menu').style.display = 'none';
    
  }
  else{
    menuClose();
  }
})