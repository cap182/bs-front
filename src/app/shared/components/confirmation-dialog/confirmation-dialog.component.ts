import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog'; // <-- ¡Importa MatDialogModule aquí!
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}