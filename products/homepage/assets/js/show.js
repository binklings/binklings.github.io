var quanju=0;
function change()
{
 quanju=quanju+1;
 kaiguan=quanju%2;
 
 if(kaiguan==1)
 {
  document.getElementById("show").style.display="none";

 }
 else
 {
   document.getElementById("show").style.display="block";

 }
 
    confirm("information hided successfully!");
    
}