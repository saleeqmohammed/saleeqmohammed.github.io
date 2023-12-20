
const text =document.querySelector('.text p');
text.innerHTML = text.textContent.split('').map(
  (char,i)=>`<span style="transform:rotate(${i*8.3}deg);">${char}</span> `
).join('');
