import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToolsService } from '../../tools.service';
import { AlertService } from '../../../alert.service';
import { LoadingModalComponent } from '../../../modals/loading-modal/loading-modal.component';

@Component({
  selector: 'wm-stockcard',
  templateUrl: './stockcard.component.html',
  styles: []
})
export class StockcardComponent implements OnInit {

  @ViewChild('modalLoading') modalLoading: LoadingModalComponent;

  perPage = 20;
  items: any = [];
  receives: any = [];
  receiveItems: any = [];
  stockCardItems: any = [];
  stockCardId: any;
  newBalanceQty = 0;
  isOpenSearchReceive = false;
  isOpenSearchRequisition = false;


  receiveType: any;
  receiveItemId: any;

  receiveId: any;
  receiveDetailId: any;
  unitGenericId: any;
  newQty: number;
  requisitions = [];

  input = false;
  passHis: any;
  modalHistory = false;
  constructor(
    private toolService: ToolsService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
  }



  // /////////////////////////////////////

  gotoReceive(receiveId: any, receiveType: any) {
    if (receiveType === 'PO') {
      this.router.navigateByUrl(`/admin/tools/stockcard/receive?receiveId=${receiveId}`);
    } else {
      this.router.navigateByUrl(`/admin/tools/stockcard/receive-other?receiveOtherId=${receiveId}`);
    }
  }

  gotoRequisition(requisitionId: any, confirmId: any) {
    this.router.navigateByUrl(`/admin/tools/stockcard/requisition?requisitionId=${requisitionId}&confirmId=${confirmId}`);
  }

  showSearchReceive() {
    this.isOpenSearchReceive = true;
  }

  showSearchRequisition() {
    this.isOpenSearchRequisition = true;
  }


  async doSearchReceives(event: any, query: any) {
    if (event.keyCode === 13) {
      try {
        this.modalLoading.show();
        const rs: any = await this.toolService.searchReceives(query);
        if (rs.ok) {
          this.receives = rs.rows;
        } else {
          this.alertService.error(rs.error);
        }

        this.modalLoading.hide();
      } catch (error) {
        this.modalLoading.hide();
        this.alertService.error(JSON.stringify(error))
      }
    }
  }

  async doSearchRequisitions(event: any, query: any) {
    if (event.keyCode === 13) {
      try {
        this.modalLoading.show();
        const rs: any = await this.toolService.searchRequisitions(query);
        if (rs.ok) {
          this.requisitions = rs.rows;
        } else {
          this.alertService.error(rs.error);
        }

        this.modalLoading.hide();
      } catch (error) {
        this.modalLoading.hide();
        this.alertService.error(JSON.stringify(error))
      }
    }
  }

  openInput() {
    console.log('test');
    this.input = !this.input;
    if (this.passHis) {
      // this.input = false;
      if (this.passHis === 'admin') {
        this.modalHistory = true;
      }
    }

  }
}
