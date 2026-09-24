const video=document.getElementById("camera"),canvas=document.getElementById("canvas"),captureBtn=document.getElementById("captureBtn"),retakeBtn=document.getElementById("retakeBtn"),previewBox=document.getElementById("previewBox"),preview=document.getElementById("preview"),personForm=document.getElementById("personForm"),submitBtn=document.getElementById("submitBtn"),cameraStatus=document.getElementById("cameraStatus"),message=document.getElementById("message");
let stream=null,capturedBlob=null,faceDetector=null,detecting=false;

async function startCamera(){
 try{
  stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:960}},audio:false});
  video.srcObject=stream; await video.play();
  if("FaceDetector" in window){
   faceDetector=new FaceDetector({fastMode:true,maxDetectedFaces:1});
   cameraStatus.textContent="Üzünüzü mərkəzə yerləşdirin...";
   detectLoop();
  }else{
   cameraStatus.textContent="Bu brauzerdə üz aşkarlama dəstəklənmir.";
  }
 }catch(e){console.error(e);cameraStatus.textContent="Kameraya giriş mümkün olmadı."}
}
async function detectLoop(){
 if(detecting||capturedBlob||!faceDetector)return;
 detecting=true;
 try{
  const faces=await faceDetector.detect(video);
  captureBtn.disabled=faces.length!==1;
  cameraStatus.textContent=faces.length===1?"Üz aşkarlandı — şəkil çəkə bilərsiniz.":"Üz tapılmadı — üzünüzü mərkəzə yerləşdirin.";
 }catch(e){console.error(e);captureBtn.disabled=true}
 detecting=false;
 if(!capturedBlob)setTimeout(detectLoop,300);
}
captureBtn.addEventListener("click",()=>{
 if(captureBtn.disabled)return;
 canvas.width=video.videoWidth;canvas.height=video.videoHeight;
 const ctx=canvas.getContext("2d");ctx.save();ctx.translate(canvas.width,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,canvas.width,canvas.height);ctx.restore();
 canvas.toBlob(blob=>{
  if(!blob)return;
  capturedBlob=blob;preview.src=URL.createObjectURL(blob);previewBox.hidden=false;personForm.hidden=false;captureBtn.hidden=true;cameraStatus.textContent="Şəkil çəkildi. Məlumatları doldurun.";validateForm();
 },"image/jpeg",.92);
});
retakeBtn.addEventListener("click",()=>{
 capturedBlob=null;preview.removeAttribute("src");previewBox.hidden=true;personForm.hidden=true;captureBtn.hidden=false;captureBtn.disabled=true;submitBtn.disabled=true;message.hidden=true;cameraStatus.textContent="Üzünüzü mərkəzə yerləşdirin...";detectLoop();
});
function validateForm(){
 const ids=["firstName","lastName","department","position"];
 submitBtn.disabled=!(capturedBlob&&ids.every(id=>document.getElementById(id).value.trim()));
}
["firstName","lastName","department","position"].forEach(id=>document.getElementById(id).addEventListener("input",validateForm));
personForm.addEventListener("submit",async e=>{
 e.preventDefault();validateForm();if(submitBtn.disabled)return;
 submitBtn.disabled=true;submitBtn.textContent="Göndərilir...";
 const data=new FormData();
 data.append("photo",capturedBlob,"photo.jpeg");
 data.append("firstName",document.getElementById("firstName").value.trim());
 data.append("lastName",document.getElementById("lastName").value.trim());
 data.append("department",document.getElementById("department").value.trim());
 data.append("position",document.getElementById("position").value.trim());
 try{
  const r=await fetch("/api/persons",{method:"POST",body:data}),result=await r.json();
  if(!r.ok||!result.success)throw new Error(result.message||"Göndərmək mümkün olmadı.");
  message.hidden=false;message.textContent="Məlumatlar uğurla göndərildi.";
  personForm.reset();capturedBlob=null;preview.removeAttribute("src");previewBox.hidden=true;personForm.hidden=true;captureBtn.hidden=false;captureBtn.disabled=true;submitBtn.textContent="Göndər";cameraStatus.textContent="Üzünüzü mərkəzə yerləşdirin...";detectLoop();
 }catch(err){message.hidden=false;message.textContent=err.message;submitBtn.disabled=false;submitBtn.textContent="Göndər"}
});
window.addEventListener("beforeunload",()=>{if(stream)stream.getTracks().forEach(t=>t.stop())});
startCamera();
