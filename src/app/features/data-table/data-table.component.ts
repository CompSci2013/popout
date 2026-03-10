import { Component, OnInit } from '@angular/core';

interface SampleRecord {
  id: number;
  name: string;
  category: string;
  value: number;
  status: string;
  date: string;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit {
  records: SampleRecord[] = [];
  columns = [
    { field: 'id', header: 'ID', width: '60px' },
    { field: 'name', header: 'Name' },
    { field: 'category', header: 'Category' },
    { field: 'value', header: 'Value', width: '100px' },
    { field: 'status', header: 'Status', width: '110px' },
    { field: 'date', header: 'Date', width: '120px' }
  ];

  globalFilter = '';

  ngOnInit(): void {
    this.records = this.generateData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active': return 'status-active';
      case 'Pending': return 'status-pending';
      case 'Archived': return 'status-archived';
      default: return '';
    }
  }

  private generateData(): SampleRecord[] {
    const names = [
      'Quantum Sensor Array', 'Neural Interface Module', 'Plasma Conduit',
      'Graviton Emitter', 'Subspace Relay', 'Fusion Core Mk-IV',
      'Tachyon Detector', 'Dark Matter Filter', 'Photon Collimator',
      'Antimatter Containment Unit', 'Phase Variance Compensator',
      'Warp Field Stabilizer', 'Deflector Grid Alpha', 'Ion Thruster Pod',
      'Magnetic Confinement Ring', 'Cryogenic Storage Cell',
      'Bio-Neural Gel Pack', 'EPS Power Tap', 'Dilithium Chamber',
      'Holographic Projector Array', 'Transporter Buffer Module',
      'Shield Harmonic Generator', 'Inertial Damper System',
      'Tactical Sensor Pod', 'Navigational Deflector'
    ];
    const categories = ['Propulsion', 'Sensors', 'Power', 'Defense', 'Science'];
    const statuses = ['Active', 'Pending', 'Archived'];

    return names.map((name, i) => ({
      id: 1000 + i,
      name,
      category: categories[i % categories.length],
      value: Math.round(Math.random() * 9000 + 1000),
      status: statuses[i % statuses.length],
      date: new Date(2026, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1)
        .toISOString().slice(0, 10)
    }));
  }
}
