import { AdminUser } from './../../Services/admin/User';
import { AdminDashboard } from './../../Services/admin/dashboard';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

@Component({

  selector: 'app-user-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css'
})
export class UserCreateComponent implements OnInit {
  token: string = "";
  companyId: string = "";
  userId: string = ""
  submitted = false;
  userTypes: { UserTypeID: number; UserType: string }[] = [];
  employeeTypes: any;
  selectedUserTypeID: number = 0;
  selectedRole: string = '';
  gstOrWcb: string = '';
  firstName: string = '';
  lastName: string = '';
  phone: string = "";
  email: string = '';
  address: string = '';
  city: string = '';
  postalCode: string = '';
  province: string = '';
  selectedFile: File | null = null;
  formError: string = '';
  constructor(
    private AdminUser: AdminUser, private AdminDashboard: AdminDashboard, private toastr: ToastrService) { }
  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {


      const companyID = localStorage.getItem('CompanyID') || '';
      const token = localStorage.getItem('Token') || '';
      const userid = localStorage.getItem('UserID') || ' ';
      this.token = token;
      this.companyId = companyID;
      this.userId = userid;

      if (companyID != null || token != null) {
        this.AdminUser.GetUserTypes(token, '-1')
          .subscribe((response) => {
            if (response.Status) {
              this.userTypes = response.Result;

            } else {
              this.toastr.error('Error ', response.Message)
            }

          }
          )

        this.AdminDashboard.GetColorNotes(companyID, token, '-1')
          .subscribe((response) => {
            if (response.Status) {
              this.employeeTypes = response.Result;

            } else {
              this.toastr.error('Error ', response.Message)
            }

          })
      }



    }
  }
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  uploadFiles(FileName: string) {
    if (this.selectedFile) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]; // remove data prefix

        const payload = {
          FileBytes: base64,
          FileName: FileName,
          FilePath: 'UserDoc'
        };

        this.AdminUser.UploadFile(this.token, payload).subscribe((response) => {
          if (response.Status) {
            console.log(response.Message)
          } else {
            this.toastr.error('Error ', response.Message)
          }

        });

        if (this.selectedFile) {
          reader.readAsDataURL(this.selectedFile); // converts file to base64
        }
        location.reload();
      }
    }
  }
  validateForm(): boolean {
    // Reset error message
    this.formError = '';

    // Check required fields
    if (!this.firstName || this.firstName.trim() === '') {
      this.formError = 'First name is required';
      return false;
    }

    if (!this.lastName || this.lastName.trim() === '') {
      this.formError = 'Last name is required';
      return false;
    }

    if (!this.email || this.email.trim() === '') {
      this.formError = 'Email is required';
      return false;
    }

    if (!this.phone) {
      this.formError = 'Phone number is required';
      return false;
    }

    if (!this.selectedUserTypeID || this.selectedUserTypeID === 0) {
      this.formError = 'User type is required';
      return false;
    }

    if (this.selectedUserTypeID === 506 && (!this.selectedRole || this.selectedRole === '')) {
      this.formError = 'Role is required';
      return false;
    }

    if (!this.address || this.address.trim() === '') {
      this.formError = 'Address is required';
      return false;
    }

    if (!this.city || this.city.trim() === '') {
      this.formError = 'City is required';
      return false;
    }

    if (!this.postalCode || this.postalCode.trim() === '') {
      this.formError = 'Postal code is required';
      return false;
    }

    if (!this.province || this.province.trim() === '') {
      this.formError = 'Province is required';
      return false;
    }

    // if (!this.selectedFile) {
    //   this.formError = 'User image is required';
    //   return false;
    // }

    // Add email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.formError = 'Please enter a valid email address';
      return false;
    }


    // Add postal code validation for Canadian format (A1A 1A1)
    const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!postalCodeRegex.test(this.postalCode)) {
      this.formError = 'Please enter a valid Canadian postal code';
      return false;
    }

    // All validations passed
    return true;
  }
  onSubmit() {
    this.submitted = true;

    if (!this.validateForm()) {
      return;
    }

    this.AdminUser.CreateUser(this.token, {
      UserName: this.firstName,
      UserFullName: this.lastName,
      UserType: this.userTypes.find((i) => i.UserTypeID === this.selectedUserTypeID)?.UserType || '',
      HashPassKey: "1234",
      EmailID: this.email,
      UserImage: "dummys",
      ContactNo: this.phone,
      CreatedBy: 0,
      CreatedOn: new Date().toISOString(),
      isActive: 1,
      CompanyID: Number(this.companyId),
      // get the company name
      CompanyName: "Milestone",
      UserTypeID: this.selectedUserTypeID,
      // prood ID
      ProofTypeID: 2331,
      Proof: "Not Available",
      SecurityNumber: "Not Available",
      ProofType: "GST No/WCB No.",
      TradeID: Number(this.selectedRole),
      TradeType: "GST No/WCB No.",
      // address type
      AddressType: 1,
      Address: this.address,
      City: this.city,
      PostalCode: this.postalCode,
      State: this.province,
      Country: "CA"

    }).subscribe((response) => {
      if (response.Status) {
        this.toastr.success('User created successfully')
        this.resetForm()
      }
      else {
        this.toastr.error('Error ', response.Message)
      }
    })
  }
  resetForm() {
    this.submitted = false;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.selectedUserTypeID = 0;
    this.selectedRole = '';
    this.companyId = '';
    this.address = '';
    this.city = '';
    this.postalCode = '';
    this.province = '';
    // If you're using a reactive form, also call: this.form.reset();
  }


}
