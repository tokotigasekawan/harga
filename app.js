let dataBarang = [];
let barangDipilih = null;

function angka(teks){

    if(!teks) return 0;

    return parseFloat(
        String(teks)
        .replace(/\./g,"")
        .replace(",00","")
        .replace(",",".")
    ) || 0;

}
fetch("UPDATE.TXT")
.then(response => response.text())
.then(data => {

    document.getElementById("updateInfo").innerHTML =
        "Terakhir Update : " + data;

});
fetch("DATA BARANG.csv")
.then(response => response.text())
.then(data => {

    const rows = data.split("\n");

    for(let i=1;i<rows.length;i++){

        const kolom = rows[i].split(";");

        if(kolom.length > 15){

            dataBarang.push({

                kode: kolom[0],
                barcode: kolom[1],
                nama: kolom[2],
                satuan: kolom[8],

                jml1: angka(kolom[10]),
                harga1: angka(kolom[11]),

                jml2: angka(kolom[12]),
                harga2: angka(kolom[13]),

                jml3: angka(kolom[14]),
                harga3: angka(kolom[15]),
                
                jml4: angka(kolom[16]),
                harga4: angka(kolom[17])

            });

        }

    }

    console.log("Barang :", dataBarang.length);

});

const cari = document.getElementById("cari");

cari.addEventListener("keyup", function(){

    const keyword = this.value.toLowerCase();

    const hasilUnik = [
        ...new Map(
            dataBarang
            .filter(item =>
                item.nama.toLowerCase().includes(keyword)
            )
            .map(item => [item.nama,item])
        ).values()
    ];

    let html = "";

    hasilUnik
    .slice(0,10)
    .forEach(item => {

        html += `
        <div
        onclick="pilihBarang('${item.nama.replace(/'/g,'')}')"
        style="
            background:white;
            padding:10px;
            margin-top:5px;
            border:1px solid #ddd;
            border-radius:5px;
            cursor:pointer;
        ">
            ${item.nama}
        </div>
        `;

    });

    document.getElementById("hasil").innerHTML = html;

});

function pilihBarang(nama){

    barangDipilih =
        dataBarang.find(item => item.nama === nama);

    document.getElementById("namaBarang").innerHTML =
    barangDipilih.nama;

document.getElementById("satuanBarang").innerHTML =
    "Satuan : " + barangDipilih.satuan;

    document.getElementById("hasil").innerHTML = "";

    document.getElementById("cari").value = "";

    document.getElementById("qty").focus();

    hitungTotal();

}

function hitungTotal(){

    if(!barangDipilih) return;

    let qty =
        parseFloat(
            document.getElementById("qty").value
        ) || 0;

    let hargaAktif = barangDipilih.harga1;

    // 1-4 = harga1
    // 5-39 = harga2
    // 40-10000 = harga3

    if(
    qty > barangDipilih.jml4 &&
    barangDipilih.harga4 > 0
){
    hargaAktif = barangDipilih.harga4;
}
else if(
    qty > barangDipilih.jml2 &&
    barangDipilih.harga3 > 0
){
    hargaAktif = barangDipilih.harga3;
}
else if(
    qty > barangDipilih.jml1 &&
    barangDipilih.harga2 > 0
){
    hargaAktif = barangDipilih.harga2;
}

    document.getElementById("harga").innerHTML =
        "Harga Satuan : Rp " +
        hargaAktif.toLocaleString("id-ID");

    let subtotal =
        qty * hargaAktif;

    document.getElementById("subtotal").innerHTML =
        "Jumlah : Rp " +
        subtotal.toLocaleString("id-ID");

}

document
.getElementById("qty")
.addEventListener("input", hitungTotal);
let keranjang = [];

function tambahKeranjang(){

    if(!barangDipilih){
        alert("Pilih barang dulu");
        return;
    }

    let qty =
        parseFloat(
            document.getElementById("qty").value
        ) || 0;

    if(qty <= 0){
        alert("Isi qty dulu");
        return;
    }

    let hargaText =
        document.getElementById("harga")
        .innerText
        .replace("Harga Satuan : Rp ","")
        .replace(/\./g,"");

    let harga =
        parseFloat(hargaText) || 0;

    let subtotal =
        qty * harga;

let existing = keranjang.find(
    item => item.nama === barangDipilih.nama
);

if(existing){

    existing.qty += qty;
    existing.subtotal =
        existing.qty * existing.harga;

}else{

    keranjang.push({

    nama: barangDipilih.nama,
    satuan: barangDipilih.satuan,
    qty: qty,

    jml1: barangDipilih.jml1,
    harga1: barangDipilih.harga1,

    jml2: barangDipilih.jml2,
    harga2: barangDipilih.harga2,

    jml3: barangDipilih.jml3,
    harga3: barangDipilih.harga3,

    jml4: barangDipilih.jml4,
    harga4: barangDipilih.harga4,

    harga: harga,
    subtotal: subtotal

});
}

tampilkanKeranjang();

document.getElementById("qty").value = "";

document.getElementById("namaBarang").innerHTML =
    "Pilih barang dulu";

    document.getElementById("satuanBarang").innerHTML =
    "Satuan : -";

document.getElementById("harga").innerHTML =
    "Harga Satuan : Rp 0";

document.getElementById("subtotal").innerHTML =
    "Jumlah : Rp 0";

barangDipilih = null;

document.getElementById("cari").focus();

}

function tampilkanKeranjang(){

    let html = "";
    let total = 0;

    keranjang.forEach((item,index) => {

        total += item.subtotal;

        html += `

<div style="
    border-bottom:1px solid #ddd;
    padding:10px 0;
">

    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
    ">

        <b>${item.nama}</b>

        <button
            onclick="hapusItem(${index})"
            style="
                background:red;
                color:white;
                width:auto;
                padding:5px 10px;
            "
        >
            X
        </button>

    </div>

    <div style="
    margin-top:10px;
    display:flex;
    align-items:center;
    gap:5px;
">

    <button
        onclick="minusQty(${index})"
        style="
            width:40px;
            padding:5px;
        "
    >
        -
    </button>

    <input
        type="number"
        step="0.01"
        value="${item.qty}"
        onchange="ubahQty(${index},this.value)"
        style="
            width:80px;
            text-align:center;
        "
    >

    <button
        onclick="plusQty(${index})"
        style="
            width:40px;
            padding:5px;
        "
    >
        +
    </button>

</div>

<div>
    Satuan : ${item.satuan}
</div>

<div style="margin-top:10px">
    Harga : Rp ${item.harga.toLocaleString("id-ID")}
</div>

<div>
    Subtotal :
    Rp ${item.subtotal.toLocaleString("id-ID")}
</div>
</div>

`;

    });

    html += `

<div style="
    margin-top:15px;
    font-size:24px;
    font-weight:bold;
    color:green;
">

    TOTAL :
    Rp ${total.toLocaleString("id-ID")}

</div>

<div style="margin-top:15px;">

    <button
        onclick="kirimWA()"
        style="
            background:#25D366;
            color:white;
            width:100%;
            padding:12px;
            border:none;
            border-radius:6px;
            font-size:16px;
            font-weight:bold;
        "
    >
        📱 Kirim Pesanan WhatsApp
    </button>

</div>

`;

    document.getElementById("keranjang")
        .innerHTML = html;

}
function hapusItem(index){

    keranjang.splice(index,1);

    tampilkanKeranjang();

}
function plusQty(index){

    keranjang[index].qty += 1;

    hitungHargaKeranjang(
        keranjang[index]
    );

    tampilkanKeranjang();

}

function minusQty(index){

    keranjang[index].qty -= 1;

    if(keranjang[index].qty <= 0){

        keranjang.splice(index,1);

    }else{

        hitungHargaKeranjang(
    keranjang[index]
);

    }

    tampilkanKeranjang();

}

function ubahQty(index,nilai){

    let qty = parseFloat(nilai) || 0;

    if(qty <= 0){

        keranjang.splice(index,1);

    }else{

        keranjang[index].qty = qty;

hitungHargaKeranjang(
    keranjang[index]
);

    }

    tampilkanKeranjang();

}
function hitungHargaKeranjang(item){

    let hargaAktif = item.harga1;

   if(
    item.qty > item.jml4 &&
    item.harga4 > 0
){
    hargaAktif = item.harga4;
}
    else if(
        item.qty > item.jml2 &&
        item.harga3 > 0
    ){
        hargaAktif = item.harga3;
    }
    else if(
        item.qty > item.jml1 &&
        item.harga2 > 0
    ){
        hargaAktif = item.harga2;
    }

    item.harga = hargaAktif;

    item.subtotal =
        item.qty * hargaAktif;

}
function kirimWA(){

    if(keranjang.length === 0){

        alert("Keranjang masih kosong");
        return;

    }

    let total = 0;

    let pesan =
`Halo Toko Tiga Sekawan,

Mohon dibuatkan pesanan berikut :

`;

    keranjang.forEach((item,index)=>{

        total += item.subtotal;

        pesan +=
`${index + 1}. ${item.nama}
Qty : ${item.qty} ${item.satuan}
Harga : Rp ${item.harga.toLocaleString("id-ID")}
*Subtotal : Rp ${item.subtotal.toLocaleString("id-ID")}*

`;

    });

   pesan +=
`========================

*TOTAL : Rp ${total.toLocaleString("id-ID")}*

Terima kasih.
`;

    window.open(
        "https://wa.me/6285559156569?text=" +
        encodeURIComponent(pesan),
        "_blank"
    );

}