import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IMyOptions } from 'mydatepicker-th';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { SearchGenericAutocompleteComponent } from 'app/directives/search-generic-autocomplete/search-generic-autocomplete.component';
import { IGeneric, } from 'app/shared';
import { SelectReceiveUnitComponent } from 'app/directives/select-receive-unit/select-receive-unit.component';
import { WarehouseService } from 'app/admin/warehouse.service';
import { ProductsService } from 'app/admin/products.service';
import { AlertService } from 'app/alert.service';
import { RequisitionService } from 'app/admin/requisition.service';
import { RequisitionTypeService } from 'app/admin/requisition-type.service';
import { WarehouseProductsService } from 'app/admin/warehouse-products.service';
import { PeriodService } from 'app/period.service';

@Component({
  selector: 'wm-requisition-fast',
  templateUrl: './requisition-fast.component.html',
  styles: []
})
export class RequisitionFastComponent implements OnInit {

  @ViewChild('modalLoading') public modalLoading: any;

  @ViewChild('selectUnits') public selectUnits: SelectReceiveUnitComponent;
  @ViewChild('searchGenericCmp') public searchGenericCmp: SearchGenericAutocompleteComponent;

  // public mask = [/\d/, /\d/, /\d/];

  warehouses: any[] = [];
  tmpwareHouses: any[] = [];
  withDrawWarehouses: any[] = [];
  wmRequisition: any;
  wmWithdraw: any;

  requisitionTypes: any[] = [];
  requisitionStatus: any[] = [];

  requisitionSummary: any = [];
  products: Array<IRequisitionOrderItem> = [];
  generics = [];
  requiSitionTypes: any = [];
  requisitionTypeID: any;

  myDatePickerOptions: IMyOptions = {
    inline: false,
    dateFormat: 'dd mmm yyyy',
    editableDateField: false,
    showClearDateBtn: false
  };

  requisitionId: any;
  requisitionDate: any;
  selectedGenericId: any;
  selectedGenericName: any;
  selectedWorkingCode: any;
  selectedUnitGenericId: any;
  selectedSmallQty: any = 0;
  selectedRequisitionQty: any;
  selectedTotalSmallQty: any = 0;
  requisitionCode: any;
  selectedRemainQty: number = 0;

  isUpdate = false;
  isSave = false;

  templates: any = [];
  templateId: any = null;

  constructor(
    private wareHouseService: WarehouseService,
    private productService: ProductsService,
    private alertService: AlertService,
    private requisitionService: RequisitionService,
    private requisitionTypeService: RequisitionTypeService,
    private route: ActivatedRoute,
    private router: Router,
    private warehouseProductService: WarehouseProductsService,
    @Inject('API_URL') private apiUrl: string,
    private periodService: PeriodService
  ) {
    this.requisitionId = this.route.snapshot.params['requisitionId'];
  }

  async ngOnInit() {

    const date = new Date();
    this.requisitionDate = {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };

    await this.getTypes();
    await this.getWarehouses();

    // if (this.requisitionId) {
    //   await this.getOrderDetail();
    //   await this.getOrderItems();
    //   this.isUpdate = true;
    // }

  }

  async getTypes() {
    this.modalLoading.show();
    try {
      const rs: any = await this.requisitionTypeService.all();
      this.modalLoading.hide();
      if (rs.ok) {
        this.requiSitionTypes = rs.rows;
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }

  async getWarehouses() {
    this.modalLoading.show();
    try {
      const rs: any = await this.wareHouseService.getWarehouse();
      this.modalLoading.hide();
      if (rs.ok) {
        this.warehouses = _.sortBy(rs.rows, 'short_code');
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }

  // async getOrderItems() {
  //   this.modalLoading.show();
  //   this.products = [];
  //   try {
  //     const rs: any = await this.requisitionService.getEditRequisitionOrderItems(this.requisitionId);
  //     this.modalLoading.hide();
  //     if (rs.ok) {
  //       this.products = rs.rows;
  //     } else {
  //       this.alertService.error(rs.error);
  //     }
  //   } catch (error) {
  //     this.modalLoading.hide();
  //     console.log(error);
  //     this.alertService.error(error.message);
  //   }
  // }

  // async getOrderDetail() {
  //   this.modalLoading.show();
  //   try {
  //     const rs: any = await this.requisitionService.getOrderDetail(this.requisitionId);
  //     this.modalLoading.hide();
  //     if (rs.ok) {
  //       const detail: IRequisitionOrder = <IRequisitionOrder>rs.detail;
  //       this.requisitionCode = detail ? detail.requisition_code : null;
  //       this.requisitionTypeID = detail ? detail.requisition_type_id : null;

  //       this.wmWithdraw = detail ? detail.wm_withdraw : null;
  //       this.wmRequisition = detail ? detail.wm_requisition : null;

  //       await this.onSelectWarehouses(null);

  //       if (detail.requisition_date) {
  //         this.requisitionDate = {
  //           date: {
  //             year: moment(detail.requisition_date).get('year'),
  //             month: moment(detail.requisition_date).get('month') + 1,
  //             day: moment(detail.requisition_date).get('date')
  //           }
  //         }
  //       }
  //     } else {
  //       this.alertService.error(rs.error);
  //     }

  //   } catch (error) {
  //     this.modalLoading.hide();
  //     this.alertService.error(error.message);
  //   }
  // }

  // changeSearchGeneric(event: any) {
  //   if (event) {
  //     this.clearItem();
  //   }
  // }

  clearItem() {
    this.selectUnits.clearUnits();
    this.selectedGenericId = null;
    this.selectedUnitGenericId = null;
    this.selectedGenericName = null;
    this.selectedWorkingCode = null;
    this.selectedSmallQty = 0;
    this.selectedTotalSmallQty = 0;
    this.selectedRequisitionQty = '';
    this.selectedRemainQty = 0;
    this.searchGenericCmp.clearSearch();
  }

  setSelectedGeneric(generic: IGeneric) {
    this.selectedGenericId = generic.generic_id;
    this.selectedGenericName = generic.generic_name;
    this.selectedWorkingCode = generic.working_code;
    this.selectedRemainQty = generic.qty;
    this.selectedRequisitionQty = 1;
    this.selectUnits.getUnits(generic.generic_id);
  }

  // onChangeUnit(event: IUnit) {
  //   this.selectedUnitGenericId = event.unit_generic_id;
  //   this.selectedSmallQty = event.qty;
  // }

  // onChangeEditUnit(event: IUnit, idx: any) {
  //   this.products[idx].unit_generic_id = event.unit_generic_id;
  //   this.products[idx].to_unit_qty = event.qty;
  //   this.products[idx].from_unit_name = event.from_unit_name;
  //   this.products[idx].to_unit_name = event.to_unit_name;
  //   this.products[idx].qty = event.qty;
  // }

  // onChangeEditQty(idx: any, qty: any) {
  //   this.products[idx].requisition_qty = qty;
  // }

  // qtyEnter(event: any) {
  //   if (event.keyCode === 13) {
  //     this.addProduct();
  //   }
  // }

  async addProduct() {
    const idx = _.findIndex(this.generics, { generic_id: this.selectedGenericId })
    if (idx > -1) {
      this.alertService.error('รายการซ้ำกรุณาแก้ไขรายการเดิม')
    } else {
      const obj: any = {};
      obj.generic_id = this.selectedGenericId;
      obj.requisition_qty = this.selectedRequisitionQty;
      obj.generic_name = this.selectedGenericName;
      obj.to_unit_qty = this.selectedSmallQty;
      obj.unit_generic_id = this.selectedUnitGenericId;
      obj.working_code = this.selectedWorkingCode;
      obj.remain_qty = this.selectedRemainQty;
      obj.products = {};
      await this.allowcate(this.selectedGenericId);
      this.generics.push(obj);
      this.clearItem();
    }
  }

  async allowcate(genericId) {
    const allocate = await this.requisitionService.getAllocate([{ 'genericId': v.generic_id, 'genericQty': v.requisition_qty * v.conversion_qty }])
    if (allocate.ok) {
      for (const z of allocate.rows) {
        let _obj: any;
        if (z.generic_id === v.generic_id) {
          if (z.pack_remain_qty > 0) {
            _obj = {
              conversion_qty: z.conversion_qty,
              wm_product_id: z.wm_product_id,
              generic_id: z.generic_id,
              expired_date: z.expired_date,
              from_unit_name: z.from_unit_name,
              lot_no: z.lot_no,
              product_name: z.product_name,
              small_remain_qty: +z.small_remain_qty,
              pack_remain_qty: +z.pack_remain_qty,
              to_unit_name: z.to_unit_name,
              unit_generic_id: z.unit_generic_id,
              confirm_qty: Math.floor(z.product_qty / z.conversion_qty)
            }
            if (v.temp_confirm_id) {
              const rsT: any = await this.requisitionService.getRequisitionConfirmTemp(v.temp_confirm_id);
              const idx = _.findIndex(rsT.rows, { wm_product_id: z.wm_product_id });
              if (idx > -1) {
                _obj.confirm_qty = rsT.rows[idx].confirm_qty / z.conversion_qty;
              }
            }
            obj.is_minus = (z.small_remain_qty - +z.product_qty) < 0;
            obj.allowcate_qty += z.product_qty;
            obj.confirmItems.push(_obj);
          }
        }
      }
    }
    this.products.push(obj);
  }
  // async getTemplateItems(templateId: any) {
  //   try {
  //     console.log(templateId)
  //     const rs: any = await this.requisitionService.getTemplateItems(templateId);
  //     if (rs.ok) {
  //       this.products = [];

  //       rs.rows.forEach(v => {
  //         const product: IRequisitionOrderItem = {};
  //         product.generic_id = v.generic_id;
  //         product.requisition_qty = 0;
  //         product.generic_name = v.generic_name;
  //         product.to_unit_qty = 0;
  //         product.unit_generic_id = v.unit_generic_id;
  //         product.from_unit_name = null;
  //         product.to_unit_name = null;
  //         product.qty = null;
  //         product.working_code = v.working_code;
  //         product.remain_qty = v.remain_qty;

  //         this.products.push(product);
  //       });
  //       console.log(this.products)
  //     }
  //   } catch (error) {
  //     this.alertService.error(error.message);
  //   }
  // }

  // removeItem(idx: any) {
  //   this.alertService.confirm('ต้องการลบรายการนี้ ใช่หรือไม่?')
  //     .then(() => {
  //       this.products.splice(idx, 1);
  //     })
  //     .catch(() => { });
  // }

  async onSelectWarehouses(event: any) {
    await this.getShipingNetwork(this.wmRequisition);
  }

  async getShipingNetwork(warehouseId: any) {
    this.modalLoading.show();
    this.withDrawWarehouses = [];
    try {
      const rs: any = await this.wareHouseService.getShipingNetwork(warehouseId, 'REQ');
      this.modalLoading.hide();
      if (rs.ok) {
        this.templates = [];
        this.withDrawWarehouses = rs.rows;
        if (rs.rows.length > 0) {
          this.wmWithdraw = rs.rows[0].destination_warehouse_id;
          this.getTemplates();
        }
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  // async save() {
  //   this.isSave = true;
  //   const reqDate = this.requisitionDate.date ? `${this.requisitionDate.date.year}-${this.requisitionDate.date.month}-${this.requisitionDate.date.day}` : null;
  //   this.alertService.confirm('ต้องการบันทึกข้อมูล ใช่หรือไม่?')
  //     .then(async () => {
  //       const order: IRequisitionOrder = {};
  //       order.requisition_date = reqDate;
  //       order.requisition_type_id = this.requisitionTypeID;
  //       order.wm_requisition = this.wmRequisition;
  //       order.wm_withdraw = this.wmWithdraw;

  //       const products: Array<IRequisitionOrderItem> = [];

  //       this.products.forEach((v: IRequisitionOrderItem) => {
  //         if (v.requisition_qty > 0) {
  //           const obj: IRequisitionOrderItem = {};
  //           obj.generic_id = v.generic_id;
  //           obj.requisition_qty = v.to_unit_qty * v.requisition_qty;
  //           obj.unit_generic_id = v.unit_generic_id;
  //           products.push(obj);
  //         }
  //       });

  //       if (!products.length) {
  //         this.alertService.error('กรุณาระบุจำนวนสินค้าที่ต้องการเบิก');
  //         this.isSave = false;
  //       } else {
  //         this.modalLoading.show();
  //         try {
  //           let rs: any;
  //           if (this.isUpdate) {
  //             rs = await this.requisitionService.updateRequisitionOrder(this.requisitionId, order, products);
  //           } else {
  //             rs = await this.requisitionService.saveRequisitionOrder(order, products);
  //           }

  //           this.modalLoading.hide();
  //           this.isSave = false;
  //           if (rs.ok) {
  //             this.router.navigate(['/admin/requisition']);
  //           } else {
  //             this.alertService.error(rs.error);
  //           }

  //         } catch (error) {
  //           this.isSave = false;
  //           this.modalLoading.hide();
  //           this.alertService.error(error.message);
  //         }
  //       }
  //     })
  //     .catch(() => {
  //       this.isSave = false;
  //       this.modalLoading.hide();
  //     })

  // }

  async getTemplates() {
    try {
      const dstWarehouseId = this.wmWithdraw;
      const srcWarehouseId = this.wmRequisition;
      if (dstWarehouseId && srcWarehouseId) {
        const rs: any = await this.requisitionService.getTemplates(srcWarehouseId, dstWarehouseId);
        if (rs.ok) {
          this.templates = rs.rows;
        } else {
          this.alertService.error(rs.error);
        }
      }
    } catch (error) {
      this.alertService.error(error.message);
    }
  }

  // async getGenericItems(event: any) {
  //   if (this.templateId) {
  //     this.getTemplateItems(this.templateId);
  //   }
  // }

}
