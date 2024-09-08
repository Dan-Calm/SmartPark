import { Component, OnInit } from '@angular/core';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-entrada-patente',
  templateUrl: './entrada-patente.page.html',
  styleUrls: ['./entrada-patente.page.scss'],
})
export class EntradaPatentePage implements OnInit {

  constructor() { }

  ngOnInit() {
    Camera.requestPermissions();
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
  
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    var imageUrl = image.webPath;
  
    // Can be set to the src of an image now
    //imageElement.src = imageUrl;
  };

}
