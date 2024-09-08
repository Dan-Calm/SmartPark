import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/),
    ]),
    name: new FormControl('', [Validators.minLength(4)]),
    patente: new FormControl('', [Validators.minLength(4)])
  })

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {
  }

  async submit() {
    if (this.form.valid){

      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.signUp(this.form.value as User).then(async res =>{

        await this.firebaseSvc.updateUser(this.form.value.name)

        let uid = res.user.uid;
        this.form.controls.uid.setValue(uid);

        // Agregar el campo tipo_usuario y estado con valores por defecto
        const userData: User = {
          ...this.form.value,
          tipo_usuario: 1,
          estado: true, // Agregar el campo estado con valor por defecto true
          ticket: '',
          fecha_creacion: new Date(), // Establecer la fecha de creación
        };

        this.setUserInfo(uid, userData);

      }).catch(error =>{
        console.log(error);

        this.utilsSvc.presentToast({
          message : error.message,
          duration : 2500,
          color : 'primary',
          position: 'middle',
          icon : 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async setUserInfo(uid: string, userData: User) {
    if (this.form.valid){

      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;
      delete userData.password;

      this.firebaseSvc.setDocument(path, userData).then(async res =>{

        this.utilsSvc.saveInLocalStorage('user', userData);
        this.utilsSvc.routerlink('/auth/disponibles');
        this.form.reset();

      }).catch(error =>{
        console.log(error);

        this.utilsSvc.presentToast({
          message : error.message,
          duration : 2500,
          color : 'primary',
          position: 'middle',
          icon : 'alert-circle-outline'
        })

      }).finally(() => {
        loading.dismiss();
      })
    }
  }
}
