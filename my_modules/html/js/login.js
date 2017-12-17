$("#login-button").click(function(){
  $.ajax({
  type: "POST",
  url:'/login',
  data: {
    username: 'Led',
    password: 'ledtest'
  },
  });
});


function login(){

}
