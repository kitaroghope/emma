function customPopUp(message, button="",type="Alert"){
    var box = `
    <div class="over">
      <div class="msg">
        <div class="card">
          <div class="card-header">
            ${type}
          </div>
          <div class="card-body">
            <h5 class="card-title">Message</h5>
            <p class="card-text">${message}</p>
          </div>`
    if(button == ""){
        box += `
            <br>
            </div>
        </div>
        </div>`
    } else {
        box += `
            <button style="margin: 0 auto;" class="btn btn-danger" onclick="btnClose()">${button}</button>
            <br>
            </div>
        </div>
        </div>`
    }
    var cAlert = document.getElementById("cAlert");
    cAlert.innerHTML=box;
}

async function postD(url){
  customPopUp("Please wait");
  fetch(url, {method: 'POST'})
  .then(async(response) => {
    // console.log(response)
      if (response.ok) {
          return response.json();
      } else {
          customPopUp("There was a problem, Please try Again","Ok","Error");
          return response.json();
      }
  })
  .then(async(data) => {
    // console.log(typeof data)
      // Handle the server response (if needed)
      if(typeof data.message !== 'undefined'){
        customPopUp(data.message,"Ok","Success");
      }else{
        customPopUp(data.statusText,"Ok","Oops");
      }
  })
}
          
async function getD(url){
  customPopUp("Please wait");
  fetch(url)
  .then(async(response) => {
    // console.log(response)
      if (response.ok) {
          return response.json();
      } else {
          customPopUp("There was a problem, Please try Again","Ok","Error");
          return response.json();
      }
  })
  .then(async(data) => {
    // console.log(typeof data)
      // Handle the server response (if needed)
      if(typeof data.message !== 'undefined'){
        customPopUp(data.message,"Ok","Success");
      }else{
        customPopUp(data.statusText,"Ok","Oops");
      }
  })
}      

function checkpass(){
  var pass = document.getElementById('password');
  var pass1 = document.getElementById('ppassword');
  var p = document.getElementById('p');
  var b = document.getElementById('btn-s');

  if(pass.value == pass1.value){
    p.className = "text-success"
    b.disabled = false;
    p.innerText = "You have confirmed your password successfully";
  }
  else{
    p.className = "text-danger"
    p.innerText = "Passwords dont match";
    b.disabled = true;
  }
}
function openl(x, op){
  $(x).parent().css("display","none");
  $(op).css("display","block");
}
// Add facility
var productsPics = 0;
$("#add-facility").click(function() {
    productsPics++;
    var facilityHtml = `
        <div class="mb-3" id="facility-${productsPics}">
                                    <label>Image ${productsPics}</label>
            <div class="row">
                <div class="col-md-4">
                    <input type="text" class="form-control fac-name-${productsPics}" name="facilities[fac ${productsPics}][name]" placeholder="Pic ${productsPics} Name" required>
                </div>
                <div class="col-md-4">
                    <textarea class="form-control fac-des-${productsPics}" id="propSDes" name="facilities[fac ${productsPics}][description]" placeholder="simple details ${productsPics}"  rows="2" required></textarea>
                </div>
                <div class="col-md-4">
                    <input type="file" class="form-control fac-img-${productsPics}" id="fac-img-${productsPics}" name="image" onchange="upLoad(this)" placeholder="Product ${productsPics}" required>
                    <div class="form-control" style="height: 200px; width: 200px; display: flex; justify-content: center; align-items: center;">
                        <img class="fac-img-${productsPics}" style="max-width: 100%; max-height: 100%;" src="">
                    </div>
                </div>
            </div>
            <button type="button" class="btn btn-danger mt-3" onclick="removeFacility(${productsPics})">Remove Facility</button>
        </div>
    `;
    $("#facilities-container").append(facilityHtml);
});

// Remove facility
window.removeFacility = function(facilityNumber) {
    $("#facility-" + facilityNumber).remove();
}

function upLoad(x){
  const file = x.files[0];
  $('.display').css('display','')
  var text = $('#propName');
  // checking if house name is added
  const imageUrl = URL.createObjectURL(file)
  $(`.${$(x).attr('id')}`).attr('src',imageUrl)
  $('#propName').prop('disabled', true);
  // creatung form data
  const formData = new FormData();
  formData.append('image', file);
  customPopUp('Wait Image is being uploaded')

  fetch(`/upload/img}`, {
    method: 'POST',
    body: formData
  }).then(response => {
      customPopUp(`image upload status is ${response.statusText}`,"ok");
    console.log(response);
  }).catch(error => {
      customPopUp(`Err: ${error.message}`,"ok");
  });
}

$('#property-form').on('submit', async (e) => {
  e.preventDefault();
  customPopUp("Wait while data is being uploaded");
  const result = {
    "product": $('#propName').val(),
    "img": $('#propPic').val().split('\\').pop(),
    "description": $('#propSDes').val(),
    "details": $('#propDes').val(),
    "units":$('#units').val(),
    "price":$('#price').val()
  };

  let fac = [];
  if (productsPics > 0) {
    for (let i = 0; i < productsPics; i++) {
      if ($(`input.fac-name-${i + 1}`).val()) {
        const m = {
          "name": $(`input.fac-name-${i + 1}`).val(),
          "description": $(`textarea.fac-des-${i + 1}`).val(),
          "image": $(`input.fac-img-${i + 1}`).val().split('\\').pop()
        };
        fac.push(m);
      }
    }
  }
  result["facilities"] = fac;

  try {
    const response = await fetch('/addProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(result), // Convert to JSON string
    });

    if (response.ok) {
      const data = await response.json();
      customPopUp(data.message, "ok", "Success");
      document.getElementById('property-form').reset();
    } else {
      customPopUp(response.status, "ok", "Something went wrong");
    }
  } catch (error) {
    customPopUp(error.message, "ok", "Error");
  }
});

  
  
  
function addLocation(x){
    var location1 = prompt("Type name of location and press ok","");
    console.log(location1)
    if(!(location1 == "" || location1 == null)){
        var newLacation = `<option value="${location1}">${location1}</option>`
        customPopUp("Wait while location is being added");
        var sys_det = {
          "tbName" : location1,
          "dbName" : "houses",
          "arr" : "locations",
        }
        var res = {"d":location1}
        const formData = new FormData();
        formData.append('data', JSON.stringify(res));
        formData.append('data1', JSON.stringify(sys_det));

        fetch(`/addData1/${location1}`, {
          method: 'POST',
          body: formData
        }).then(response => {
          if (response.ok) {
            $('#tbName').append(newLacation);
            return response.json();
          } else {
            return response.json();
          }
        }).then(data => {
          if (data) {
            customPopUp(data.status);
          }
        }).catch(error => {
          console.error(error.message);
          customPopUp(`Error: ${error.message}`,"ok");
        });
    }
    else{
        customPopUp("nothing was added","ok");
    }
}