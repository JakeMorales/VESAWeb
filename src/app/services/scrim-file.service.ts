import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrimFileService {
  private static readonly ALL_SCRIM_BATCH_FILES: string[] = [
    "scrim_2024_07_03_id_7058.json",
    "scrim_2024_07_03_id_7059.json",
    "scrim_2024_07_04_id_7100.json",
    "scrim_2024_07_08_id_7174.json",
    "scrim_2024_07_10_id_7215.json",
    "scrim_2024_08_09_id_7932.json",
    "scrim_2024_08_16_id_8041.json",
    "scrim_2024_08_23_id_8178.json",
    "scrim_2024_09_03_id_8328.json",
    "scrim_2024_09_05_id_8368.json",
    "scrim_2024_09_05_id_8369.json",
    "scrim_2024_09_19_id_8655.json",
    "scrim_2024_09_19_id_8656.json",
    "scrim_2024_09_20_id_8672.json",
    "scrim_2024_09_21_id_8718.json",
    "scrim_2024_09_23_id_8766.json",
    "scrim_2024_09_25_id_8806.json",
    "scrim_2024_09_29_id_8903.json",
    "scrim_2024_09_30_id_8934.json",
    "scrim_2024_10_01_id_8958.json",
    "scrim_2024_10_01_id_8960.json",
    "scrim_2024_10_04_id_9068.json",
    "scrim_2024_10_14_id_9333.json",
    "scrim_2024_10_24_id_9669.json",
    "scrim_2024_10_26_id_9751.json",
    "scrim_2024_10_30_id_9820.json",
    "scrim_2024_10_30_id_9822.json",
    "scrim_2024_10_31_id_9843.json",
    "scrim_2024_10_31_id_9846.json",
    "scrim_2024_10_31_id_9848.json",
    "scrim_2024_11_01_id_9861.json",
    "scrim_2024_11_04_id_9910.json",
    "scrim_2024_11_05_id_9925.json",
    "scrim_2024_11_07_id_9950.json",
    "scrim_2024_11_08_id_9989.json",
    "scrim_2024_11_10_id_9994.json",
    "scrim_2024_11_13_id_10067.json",
    "scrim_2024_11_14_id_10069.json",
    "scrim_2024_11_26_id_10280.json",
    "scrim_2024_12_01_id_10350.json",
    "scrim_2024_12_01_id_10351.json",
    "scrim_2024_12_02_id_10356.json",
    "scrim_2024_12_03_id_10372.json",
    "scrim_2024_12_06_id_10427.json",
    "scrim_2024_12_07_id_10458.json",
    "scrim_2024_12_08_id_10467.json",
    "scrim_2024_12_09_id_10472.json",
    "scrim_2024_12_16_id_10550.json",
    "scrim_2024_12_18_id_10571.json",
    "scrim_2025_01_02_id_10695.json",
    "scrim_2025_01_12_id_10790.json",
    "scrim_2025_01_13_id_10795.json",
    "scrim_2025_01_22_id_10920.json",
    "scrim_2025_01_25_id_10956.json",
    "scrim_2025_01_25_id_10958.json",
    "scrim_2025_01_26_id_10975.json",
    "scrim_2025_01_26_id_10979.json",
    "scrim_2025_02_03_id_11077.json",
    "scrim_2025_02_05_id_11110.json",
    "scrim_2025_02_11_id_11276.json",
    "scrim_2025_02_17_id_11396.json",
    "scrim_2025_02_17_id_11400.json",
    "scrim_2025_02_19_id_11463.json",
    "scrim_2025_02_22_id_11590.json",
    "scrim_2025_02_26_id_11735.json",
    "scrim_2025_02_26_id_11736.json",
    "scrim_2025_03_08_id_12022.json",
    "scrim_2025_03_16_id_12246.json",
    "scrim_2025_03_17_id_12252.json",
    "scrim_2025_04_02_id_12556.json",
    "scrim_2025_04_07_id_12663.json",
    "scrim_2025_04_09_id_12706.json",
    "scrim_2025_04_11_id_12799.json",
    "scrim_2025_04_12_id_12804.json",
    "scrim_2025_04_13_id_12822.json",
    "scrim_2025_04_18_id_12933.json",
    "scrim_2025_04_25_id_13075.json",
    "scrim_2025_04_26_id_13135.json",
    "scrim_2025_05_06_id_13287.json",
    "scrim_2025_05_14_id_13372.json",
    "scrim_2025_05_16_id_13423.json",
    "scrim_2025_05_18_id_13460.json",
    "scrim_2025_05_23_id_13585.json",
    "scrim_2025_05_28_id_13677.json",
    "scrim_2025_05_30_id_13730.json",
    "scrim_2025_06_07_id_13916.json",
    "scrim_2025_06_09_id_13933.json",
    "scrim_2025_06_12_id_13981.json",
    "scrim_2025_06_21_id_14154.json",
    "scrim_2025_07_03_id_14332.json",
    "scrim_2025_07_04_id_14350.json",
    "scrim_2025_07_11_id_14462.json",
    "scrim_2025_07_16_id_14548.json",
    "scrim_2025_07_22_id_14687.json",
    "scrim_2025_07_24_id_14739.json",
    "scrim_2025_08_01_id_14942.json",
    "scrim_2025_08_04_id_14989.json",
    "scrim_2025_08_10_id_None.json",
    // ... (add all remaining file names here) ...
  ];

  constructor(private http: HttpClient) {}

  getAllScrimBatchFiles(): string[] {
    return ScrimFileService.ALL_SCRIM_BATCH_FILES;
  }

  loadAllScrimBatchFiles(): Observable<any[]> {
    const fileNames = this.getAllScrimBatchFiles();
    const fileRequests = fileNames.map(name =>
      this.http.get<any>(`assets/scrims_batch/${name}`).pipe(catchError(() => of(null)))
    );
    return forkJoin(fileRequests);
  }
}
