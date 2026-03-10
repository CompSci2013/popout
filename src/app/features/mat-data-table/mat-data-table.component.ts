import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

interface CrewMember {
  id: number;
  name: string;
  rank: string;
  department: string;
  clearance: number;
  status: string;
  enlistDate: string;
}

@Component({
  selector: 'app-mat-data-table',
  templateUrl: './mat-data-table.component.html',
  styleUrls: ['./mat-data-table.component.scss']
})
export class MatDataTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'rank', 'department', 'clearance', 'status', 'enlistDate'];
  dataSource = new MatTableDataSource<CrewMember>();
  filterValue = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.dataSource.data = this.generateCrew();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'On Duty': return 'status-on-duty';
      case 'Shore Leave': return 'status-shore-leave';
      case 'Suspended': return 'status-suspended';
      default: return '';
    }
  }

  private generateCrew(): CrewMember[] {
    const crew = [
      { name: 'Kira Vasquez', rank: 'Commander', department: 'Bridge', clearance: 9 },
      { name: 'Thane Okoye', rank: 'Lieutenant', department: 'Engineering', clearance: 7 },
      { name: 'Elara Johansson', rank: 'Ensign', department: 'Science', clearance: 4 },
      { name: 'Rho Nakamura', rank: 'Captain', department: 'Bridge', clearance: 10 },
      { name: 'Dax Petrov', rank: 'Chief', department: 'Medical', clearance: 8 },
      { name: 'Zara Mbeki', rank: 'Lieutenant', department: 'Tactical', clearance: 7 },
      { name: 'Orion Reeves', rank: 'Ensign', department: 'Navigation', clearance: 4 },
      { name: 'Nova Chen', rank: 'Commander', department: 'Science', clearance: 9 },
      { name: 'Kai Andersen', rank: 'Crewman', department: 'Engineering', clearance: 2 },
      { name: 'Lyra Osei-Bonsu', rank: 'Lieutenant', department: 'Communications', clearance: 6 },
      { name: 'Atlas Kowalski', rank: 'Chief', department: 'Security', clearance: 8 },
      { name: 'Seren Patel', rank: 'Ensign', department: 'Medical', clearance: 4 },
      { name: 'Juno Eriksson', rank: 'Lieutenant', department: 'Engineering', clearance: 7 },
      { name: 'Cass Moreno', rank: 'Crewman', department: 'Operations', clearance: 2 },
      { name: 'Rigel Kim', rank: 'Commander', department: 'Tactical', clearance: 9 },
      { name: 'Vega Oduya', rank: 'Ensign', department: 'Navigation', clearance: 4 },
      { name: 'Sol Fitzgerald', rank: 'Lieutenant', department: 'Science', clearance: 6 },
      { name: 'Astra Volkov', rank: 'Chief', department: 'Engineering', clearance: 8 },
      { name: 'Comet Da Silva', rank: 'Crewman', department: 'Medical', clearance: 3 },
      { name: 'Nyx Tanaka', rank: 'Captain', department: 'Bridge', clearance: 10 }
    ];

    const statuses = ['On Duty', 'On Duty', 'Shore Leave', 'On Duty', 'Suspended'];

    return crew.map((c, i) => ({
      id: 2000 + i,
      ...c,
      status: statuses[i % statuses.length],
      enlistDate: new Date(2020 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString().slice(0, 10)
    }));
  }
}
