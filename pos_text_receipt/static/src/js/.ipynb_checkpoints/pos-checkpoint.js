odoo.define('pos_text_receipt', function (require) {
"use strict";

    const models = require('point_of_sale.models');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    const OrderReceipt = require('point_of_sale.OrderReceipt');

    class PosTicketText extends PosComponent {
        constructor() {
            super(...arguments);
            this._receiptEnv = this.props.order.getOrderReceiptEnv();
        }
        willUpdateProps(nextProps) {
            this._receiptEnv = nextProps.order.getOrderReceiptEnv();
        }
        get receipt() {
            return this.receiptEnv.receipt;
        }
        get orderlines() {
            return this.receiptEnv.orderlines;
        }
        get paymentlines() {
            return this.receiptEnv.paymentlines;
        }
        get isTaxIncluded() {
            return Math.abs(this.receipt.subtotal - this.receipt.total_with_tax) <= 0.000001;
        }
        get receiptEnv () {
          return this._receiptEnv;
        }
        isSimple(line) {
            return (
                line.discount === 0 &&
                line.unit_name === 'Units' &&
                line.quantity === 1 &&
                !(
                    line.display_discount_policy == 'without_discount' &&
                    line.price != line.price_lst
                )
            );
        }
    }
    PosTicketText.template = 'PosTicketText';
    Registries.Component.add(PosTicketText);


    const PosReceiptScreen = (ReceiptScreen) =>
        class extends ReceiptScreen {
            async print_receipt() {
            	var order = this.env.pos.get_order();
                if (order.to_invoice==false) {
                    const fixture = document.createElement('div');
                    const orderReceipt = new (Registries.Component.get(PosTicketText))(this, { order });
                    await orderReceipt.mount(fixture);
                    const p_data = orderReceipt.el.outerHTML;
                    var p_data1 = p_data.replace("<pre>", "");
                    var p_data2 = p_data1.replace("</pre>", "");
                    $(".custom_receipt").text(p_data2);

                    var textFile = null,makeTextFile = function (text) {
                        var data = new Blob([text], {type: 'text/plain'});
                        if (textFile !== null) {
                            window.URL.revokeObjectURL(textFile);
                        }
                        textFile = window.URL.createObjectURL(data);
                        return textFile;
                    };
                    var notWorking = function(html) {
                        var el = document.createElement('div');
                        el.innerHTML = html;
                        return el.childNodes[0];
                    }

                    var userDetails=$(".custom_receipt").val();
                    var link = document.getElementById('downloadlink');
                    
                    link.href = makeTextFile(userDetails);
                    link.click();  
                }
            }
        }

    Registries.Component.extend(ReceiptScreen, PosReceiptScreen);    
});

