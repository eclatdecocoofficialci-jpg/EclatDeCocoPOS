/* ================= PRINT FACTURE A5 FINAL ================= */
function printInvoice(){

  const paymentLabels = {
    cash:"Cash",
    orange:"Orange Money",
    wave:"Wave"
  };

  const selectedPayment =
    paymentLabels[paymentMethod] || paymentMethod;

  const deliveryValue =
    document.getElementById("delivery")?.value || 0;

  const invoiceHTML = `

    <div style="
      font-family:Poppins,sans-serif;
      padding:10px;
    ">

      <!-- HEADER -->
      <div style="text-align:center;">

        <h2 style="
          margin-bottom:2px;
          color:#e91e63;
        ">
          Bienvenue à Éclat de Coco
        </h2>

        <p style="
          margin-top:0;
          font-size:14px;
          color:#666;
        ">
          Abidjan - Côte d’Ivoire
        </p>

      </div>

      <hr>

      <!-- INFOS -->
      <h3>
        Facture N°:
        ${document.getElementById("invoice-id").innerText}
      </h3>

      <p>
        <strong>Client:</strong>
        ${document.getElementById("client-name").value || "-"}
      </p>

      <p>
        <strong>Téléphone:</strong>
        ${document.getElementById("client-phone").value || "-"}
      </p>

      <p>
        <strong>Date:</strong>
        ${document.getElementById("date").value || "-"}
      </p>

      <!-- TABLE -->
      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
      ">

        <thead>
          <tr>

            <th style="
              border:1px solid #ddd;
              padding:8px;
              background:#ffe6ef;
            ">
              Produit
            </th>

            <th style="
              border:1px solid #ddd;
              padding:8px;
              background:#ffe6ef;
            ">
              Qté
            </th>

            <th style="
              border:1px solid #ddd;
              padding:8px;
              background:#ffe6ef;
            ">
              Prix
            </th>

            <th style="
              border:1px solid #ddd;
              padding:8px;
              background:#ffe6ef;
            ">
              Total
            </th>

          </tr>
        </thead>

        <tbody>
          ${document.getElementById("invoice-body").innerHTML}
        </tbody>

      </table>

      <!-- LIVRAISON -->
      <p style="
        margin-top:15px;
        font-size:15px;
      ">
        <strong>Livraison:</strong>
        ${deliveryValue} FCFA
      </p>

      <!-- PAIEMENT -->
      <p style="
        font-size:15px;
      ">
        <strong>Paiement:</strong>
        ${selectedPayment}
      </p>

      <!-- TOTAL -->
      <h2 style="
        text-align:right;
        margin-top:20px;
        color:#e91e63;
      ">
        Total:
        ${document.getElementById("grand-total").innerText}
      </h2>

      <p style="
        text-align:center;
        margin-top:40px;
        color:#e91e63;
        font-size:14px;
      ">
        Merci d’avoir choisi Éclat de Coco 💗
      </p>

    </div>
  `;

  const win =
    window.open("", "", "width=700,height=900");

  win.document.write(`

    <html>

    <head>

      <title>Facture</title>

      <style>

        @page{
          size:A5;
          margin:10mm;
        }

        body{
          font-family:Poppins,sans-serif;
          margin:0;
          padding:0;
          background:white;
        }

      </style>

    </head>

    <body onload="window.print();window.close();">

      ${invoiceHTML}

    </body>

    </html>
  `);

  win.document.close();
}
