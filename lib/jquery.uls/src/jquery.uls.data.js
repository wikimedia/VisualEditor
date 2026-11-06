( function () { function r( e, n, t ) { function o( i, f ) { if ( !n[ i ] ) { if ( !e[ i ] ) { var c = typeof require === 'function' && require; if ( !f && c ) { return c( i, !0 ); } if ( u ) { return u( i, !0 ); } var a = new Error( "Cannot find module '" + i + "'" ); throw a.code = 'MODULE_NOT_FOUND', a; } var p = n[ i ] = { exports: {} }; e[ i ][ 0 ].call( p.exports, function ( r ) { var n = e[ i ][ 1 ][ r ]; return o( n || r ); }, p, p.exports, r, e, n, t ); } return n[ i ].exports; } for ( var u = typeof require === 'function' && require, i = 0; i < t.length; i++ ) { o( t[ i ] ); } return o; } return r; }() )( {
	1: [ function ( require, module, exports ) {
		module.exports = ( function ( $ ) {
			$.uls = $.uls || {};
			$.uls.data =
{
    "languages": {
        "aa": [
            "Latn",
            [
                "AF"
            ],
            "Qafár af"
        ],
        "aae": [
            "Latn",
            [
                "EU"
            ],
            "arbërisht"
        ],
        "ab": [
            "Cyrl",
            [
                "EU"
            ],
            "аԥсшәа"
        ],
        "abe": [
            "Latn",
            [
                "AM"
            ],
            "Wôbanakiôdwawôgan"
        ],
        "abr": [
            "Latn",
            [
                "AF"
            ],
            "Abron"
        ],
        "abs": [
            "Latn",
            [
                "AS"
            ],
            "Bahasa Ambon"
        ],
        "ace": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Acèh"
        ],
        "acf": [
            "Latn",
            [
                "AM"
            ],
            "Kwéyòl Sent Lisi"
        ],
        "ach": [
            "Latn",
            [
                "AF"
            ],
            "Acoli"
        ],
        "acm": [
            "Arab",
            [
                "ME"
            ],
            "عراقي"
        ],
        "acq": [
            "Arab",
            [
                "ME",
                "AF"
            ],
            "تعزية-عدنية"
        ],
        "ada": [
            "Latn",
            [
                "AF"
            ],
            "Dangme"
        ],
        "ady": [
            "Cyrl",
            [
                "EU",
                "ME"
            ],
            "адыгабзэ"
        ],
        "ady-cyrl": [
            "ady"
        ],
        "ady-latn": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "Adygabze"
        ],
        "aeb": [
            "Arab",
            [
                "AF"
            ],
            "تونسي"
        ],
        "aeb-arab": [
            "aeb"
        ],
        "aeb-latn": [
            "Latn",
            [
                "AF"
            ],
            "Tûnsî"
        ],
        "af": [
            "Latn",
            [
                "AF"
            ],
            "Afrikaans"
        ],
        "agq": [
            "Latn",
            [
                "AF"
            ],
            "aghɨ̂m"
        ],
        "agr": [
            "Latn",
            [
                "AM"
            ],
            "Awajún"
        ],
        "ahr": [
            "Deva",
            [
                "AS"
            ],
            "अहिराणी"
        ],
        "aig": [
            "Latn",
            [
                "AM"
            ],
            "Aanteegan an' Baabyuudan"
        ],
        "aii": [
            "Syrc",
            [
                "ME"
            ],
            "ܣܘܪܝܬ"
        ],
        "ajg": [
            "Latn",
            [
                "AF"
            ],
            "ajagbe"
        ],
        "ajp": [
            "apc"
        ],
        "ajp-arab": [
            "apc"
        ],
        "ajp-latn": [
            "apc-latn"
        ],
        "akb": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Batak Angkola"
        ],
        "akz": [
            "Latn",
            [
                "AM"
            ],
            "Albaamo innaaɬiilka"
        ],
        "ale": [
            "Latn",
            [
                "AM",
                "AS"
            ],
            "unangam tunuu"
        ],
        "ale-cyrl": [
            "Cyrl",
            [
                "AS"
            ],
            "унаӈам тунуу"
        ],
        "aln": [
            "Latn",
            [
                "EU"
            ],
            "Gegë"
        ],
        "als": [
            "sq"
        ],
        "alt": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "алтай тил"
        ],
        "am": [
            "Ethi",
            [
                "AF"
            ],
            "አማርኛ"
        ],
        "ami": [
            "Latn",
            [
                "AS"
            ],
            "Pangcah"
        ],
        "an": [
            "Latn",
            [
                "EU"
            ],
            "aragonés"
        ],
        "ang": [
            "Latn",
            [
                "EU"
            ],
            "Ænglisc"
        ],
        "ann": [
            "Latn",
            [
                "AF"
            ],
            "Obolo"
        ],
        "anp": [
            "Deva",
            [
                "AS"
            ],
            "अंगिका"
        ],
        "apc": [
            "Arab",
            [
                "ME"
            ],
            "شامي"
        ],
        "apc-arab": [
            "apc"
        ],
        "apc-latn": [
            "Latn",
            [
                "ME"
            ],
            "šāmi"
        ],
        "apw": [
            "Latn",
            [
                "AM"
            ],
            "Ndee biyati'"
        ],
        "ar": [
            "Arab",
            [
                "AF",
                "ME"
            ],
            "العربية"
        ],
        "ar-001": [
            "ar"
        ],
        "arc": [
            "Syrc",
            [
                "ME"
            ],
            "ܐܪܡܝܐ"
        ],
        "arn": [
            "Latn",
            [
                "AM"
            ],
            "mapudungun"
        ],
        "aro": [
            "Latn",
            [
                "AM"
            ],
            "Araona"
        ],
        "arq": [
            "Arab",
            [
                "AF",
                "ME"
            ],
            "جازايرية"
        ],
        "ars": [
            "Arab",
            [
                "ME"
            ],
            "نجدي"
        ],
        "ary": [
            "Arab",
            [
                "AF",
                "ME"
            ],
            "الدارجة"
        ],
        "ary-arab": [
            "ary"
        ],
        "ary-latn": [
            "Latn",
            [
                "AF",
                "ME"
            ],
            "ed-dārija"
        ],
        "arz": [
            "Arab",
            [
                "AF",
                "ME"
            ],
            "مصرى"
        ],
        "as": [
            "Beng",
            [
                "AS"
            ],
            "অসমীয়া"
        ],
        "ase": [
            "Sgnw",
            [
                "AM"
            ],
            "American Sign Language"
        ],
        "ast": [
            "Latn",
            [
                "EU"
            ],
            "asturianu"
        ],
        "atj": [
            "Latn",
            [
                "AM"
            ],
            "atikamekw"
        ],
        "atv": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "тÿндÿк алтай тил"
        ],
        "av": [
            "Cyrl",
            [
                "EU"
            ],
            "авар"
        ],
        "avk": [
            "Latn",
            [
                "WW"
            ],
            "Kotava"
        ],
        "awa": [
            "Deva",
            [
                "AS"
            ],
            "अवधी"
        ],
        "ay": [
            "Latn",
            [
                "AM"
            ],
            "Aymar aru"
        ],
        "ayh": [
            "Arab",
            [
                "ME"
            ],
            "الحضرمية"
        ],
        "az": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "azərbaycanca"
        ],
        "az-arab": [
            "azb"
        ],
        "az-cyrl": [
            "Cyrl",
            [
                "EU",
                "ME"
            ],
            "азәрбајҹанҹа"
        ],
        "az-latn": [
            "az"
        ],
        "azb": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "تۆرکجه"
        ],
        "azj": [
            "az"
        ],
        "ba": [
            "Cyrl",
            [
                "EU"
            ],
            "башҡортса"
        ],
        "ban": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Bali"
        ],
        "ban-bali": [
            "Bali",
            [
                "AS",
                "PA"
            ],
            "ᬩᬮᬶ"
        ],
        "bar": [
            "Latn",
            [
                "EU"
            ],
            "Boarisch"
        ],
        "bas": [
            "Latn",
            [
                "AF"
            ],
            "ɓasaá"
        ],
        "bat-smg": [
            "sgs"
        ],
        "bax": [
            "Latn",
            [
                "AF"
            ],
            "Shüpamom"
        ],
        "bax-bamu": [
            "Bamu",
            [
                "AF"
            ],
            "ꚶꛉ꛰꛲ꚫꛦꚳ"
        ],
        "bbc": [
            "bbc-latn"
        ],
        "bbc-batk": [
            "Batk",
            [
                "AS"
            ],
            "ᯅᯖᯂ᯲ ᯖᯬᯅ"
        ],
        "bbc-latn": [
            "Latn",
            [
                "AS"
            ],
            "Batak Toba"
        ],
        "bcc": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "جهلسری بلوچی"
        ],
        "bci": [
            "Latn",
            [
                "AF"
            ],
            "wawle"
        ],
        "bcl": [
            "Latn",
            [
                "AS"
            ],
            "Bikol Central"
        ],
        "bdr": [
            "Latn",
            [
                "AS"
            ],
            "Bajau Sama"
        ],
        "be": [
            "Cyrl",
            [
                "EU"
            ],
            "беларуская"
        ],
        "be-tarask": [
            "Cyrl",
            [
                "EU"
            ],
            "беларуская (тарашкевіца)"
        ],
        "be-x-old": [
            "be-tarask"
        ],
        "bem": [
            "Latn",
            [
                "AF"
            ],
            "IciBemba"
        ],
        "bew": [
            "Latn",
            [
                "AS"
            ],
            "Betawi"
        ],
        "bfa": [
            "Latn",
            [
                "AF"
            ],
            "Bari"
        ],
        "bfq": [
            "Taml",
            [
                "AS"
            ],
            "படகா"
        ],
        "bft": [
            "Arab",
            [
                "AS"
            ],
            "بلتی"
        ],
        "bfw": [
            "Orya",
            [
                "AS"
            ],
            "ରେମସାମ୍"
        ],
        "bg": [
            "Cyrl",
            [
                "EU"
            ],
            "български"
        ],
        "bgc": [
            "Deva",
            [
                "AS"
            ],
            "हरियाणवी"
        ],
        "bgc-arab": [
            "Arab",
            [
                "AS"
            ],
            "ہریانوی"
        ],
        "bgn": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "روچ کپتین بلوچی"
        ],
        "bh": [
            "bho"
        ],
        "bho": [
            "Deva",
            [
                "AS"
            ],
            "भोजपुरी"
        ],
        "bi": [
            "Latn",
            [
                "PA"
            ],
            "Bislama"
        ],
        "bin": [
            "Latn",
            [
                "AF"
            ],
            "Ẹdo"
        ],
        "bjn": [
            "Latn",
            [
                "AS"
            ],
            "Banjar"
        ],
        "bkm": [
            "Latn",
            [
                "AF"
            ],
            "Itaŋikom"
        ],
        "blc": [
            "Latn",
            [
                "AM"
            ],
            "ItNuxalkmc"
        ],
        "blk": [
            "Mymr",
            [
                "AS"
            ],
            "ပအိုဝ်ႏဘာႏသာႏ"
        ],
        "bm": [
            "Latn",
            [
                "AF"
            ],
            "bamanankan"
        ],
        "bn": [
            "Beng",
            [
                "AS"
            ],
            "বাংলা"
        ],
        "bnn": [
            "Latn",
            [
                "AS"
            ],
            "bunun"
        ],
        "bo": [
            "Tibt",
            [
                "AS"
            ],
            "བོད་ཡིག"
        ],
        "bol": [
            "Latn",
            [
                "AF"
            ],
            "bòo pìkkà"
        ],
        "bom": [
            "Latn",
            [
                "AF"
            ],
            "bèrom"
        ],
        "bpy": [
            "Beng",
            [
                "AS"
            ],
            "বিষ্ণুপ্রিয়া মণিপুরী"
        ],
        "bqi": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "بختیاری"
        ],
        "br": [
            "Latn",
            [
                "EU"
            ],
            "brezhoneg"
        ],
        "brh": [
            "Latn",
            [
                "ME",
                "AS"
            ],
            "Bráhuí"
        ],
        "brx": [
            "Deva",
            [
                "AS"
            ],
            "बर'"
        ],
        "bs": [
            "Latn",
            [
                "EU"
            ],
            "bosanski"
        ],
        "btd": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Batak Dairi"
        ],
        "btm": [
            "Latn",
            [
                "AS"
            ],
            "Mandailing"
        ],
        "bto": [
            "Latn",
            [
                "AS"
            ],
            "Iriga Bicolano"
        ],
        "bts": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Sahap Simalungun"
        ],
        "btx": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "cakap Karo"
        ],
        "btz": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Batak Alas-Kluet"
        ],
        "bug": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Basa Ugi"
        ],
        "bug-bugi": [
            "Bugi",
            [
                "AS",
                "PA"
            ],
            "ᨅᨔ ᨕᨘᨁᨗ"
        ],
        "bug-latn": [
            "bug"
        ],
        "bum": [
            "Latn",
            [
                "AF"
            ],
            "bulu"
        ],
        "bwr": [
            "Latn",
            [
                "AF"
            ],
            "bura"
        ],
        "bxr": [
            "Cyrl",
            [
                "AS"
            ],
            "буряад"
        ],
        "byn": [
            "Ethi",
            [
                "AF"
            ],
            "ብሊን"
        ],
        "byv": [
            "Latn",
            [
                "AF"
            ],
            "Mə̀dʉ̂mbɑ̀"
        ],
        "bzj": [
            "Latn",
            [
                "AM"
            ],
            "Bileez Kriol"
        ],
        "bzs": [
            "Sgnw",
            [
                "AM"
            ],
            "Língua brasileira de sinais"
        ],
        "ca": [
            "Latn",
            [
                "EU"
            ],
            "català"
        ],
        "cak": [
            "Latn",
            [
                "AM"
            ],
            "Kaqchikel"
        ],
        "cbk": [
            "Latn",
            [
                "AS"
            ],
            "Chavacano de Zamboanga"
        ],
        "cbk-zam": [
            "cbk"
        ],
        "ccp": [
            "Cakm",
            [
                "AS"
            ],
            "𑄌𑄋𑄴𑄟𑄳𑄦"
        ],
        "cdo": [
            "Latn",
            [
                "AS"
            ],
            "閩東語 \/ Mìng-dĕ̤ng-ngṳ̄"
        ],
        "cdo-hani": [
            "Hani",
            [
                "AS"
            ],
            "閩東語（漢字）"
        ],
        "cdo-hans": [
            "Hans",
            [
                "AS"
            ],
            "闽东语（简化汉字）"
        ],
        "cdo-hant": [
            "Hant",
            [
                "AS"
            ],
            "閩東語（傳統漢字）"
        ],
        "cdo-latn": [
            "Latn",
            [
                "AS"
            ],
            "Mìng-dĕ̤ng-ngṳ̄ (Bàng-uâ-cê)"
        ],
        "ce": [
            "Cyrl",
            [
                "EU"
            ],
            "нохчийн"
        ],
        "ceb": [
            "Latn",
            [
                "AS"
            ],
            "Cebuano"
        ],
        "ch": [
            "Latn",
            [
                "PA"
            ],
            "Chamoru"
        ],
        "chm": [
            "mhr"
        ],
        "chn": [
            "Latn",
            [
                "AM"
            ],
            "chinuk wawa"
        ],
        "cho": [
            "Latn",
            [
                "AM"
            ],
            "Chahta anumpa"
        ],
        "chr": [
            "Cher",
            [
                "AM"
            ],
            "ᏣᎳᎩ"
        ],
        "chy": [
            "Latn",
            [
                "AM"
            ],
            "Tsetsêhestâhese"
        ],
        "ciw": [
            "Latn",
            [
                "AM"
            ],
            "Anishinaabemowin"
        ],
        "cja": [
            "cja-latn"
        ],
        "cja-arab": [
            "Arab",
            [
                "AS"
            ],
            "چم فور"
        ],
        "cja-cham": [
            "Cham",
            [
                "AS"
            ],
            "ꨌꩌ ꨚꨭꩉ"
        ],
        "cja-latn": [
            "Latn",
            [
                "AS"
            ],
            "Cam pur"
        ],
        "cjk": [
            "Latn",
            [
                "AF"
            ],
            "cokwe"
        ],
        "cjm": [
            "cjm-cham"
        ],
        "cjm-arab": [
            "Arab",
            [
                "AS"
            ],
            "چم فاي"
        ],
        "cjm-cham": [
            "Cham",
            [
                "AS"
            ],
            "ꨌꩌ ꨚꨰ"
        ],
        "cjm-latn": [
            "Latn",
            [
                "AS"
            ],
            "Cam pai"
        ],
        "cjy": [
            "Hant",
            [
                "AS"
            ],
            "晉語"
        ],
        "cjy-hans": [
            "Hans",
            [
                "AS"
            ],
            "晋语（简化字）"
        ],
        "cjy-hant": [
            "Hant",
            [
                "AS"
            ],
            "晉語（正字）"
        ],
        "ckb": [
            "Arab",
            [
                "ME"
            ],
            "کوردی"
        ],
        "cko": [
            "Latn",
            [
                "AF"
            ],
            "Anufɔ"
        ],
        "ckt": [
            "Cyrl",
            [
                "AS"
            ],
            "ԓыгъоравэтԓьэн"
        ],
        "ckv": [
            "Latn",
            [
                "AS"
            ],
            "Kebalan"
        ],
        "cnh": [
            "Latn",
            [
                "AS"
            ],
            "Lai holh"
        ],
        "cnr": [
            "cnr-latn"
        ],
        "cnr-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "црногорски"
        ],
        "cnr-latn": [
            "Latn",
            [
                "EU"
            ],
            "crnogorski"
        ],
        "co": [
            "Latn",
            [
                "EU"
            ],
            "corsu"
        ],
        "cop": [
            "Copt",
            [
                "AF",
                "ME"
            ],
            "ϯⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ"
        ],
        "cps": [
            "Latn",
            [
                "AS"
            ],
            "Capiceño"
        ],
        "cpx": [
            "Hant",
            [
                "AS"
            ],
            "莆仙語 \/ Pó-sing-gṳ̂"
        ],
        "cpx-hans": [
            "Hans",
            [
                "AS"
            ],
            "莆仙语（简体）"
        ],
        "cpx-hant": [
            "Hant",
            [
                "AS"
            ],
            "莆仙語（繁體）"
        ],
        "cpx-latn": [
            "Latn",
            [
                "AS"
            ],
            "Pó-sing-gṳ̂ (Báⁿ-uā-ci̍)"
        ],
        "cr": [
            "Cans",
            [
                "AM"
            ],
            "ᓀᐦᐃᔭᐍᐏᐣ"
        ],
        "cr-cans": [
            "cr"
        ],
        "cr-latn": [
            "Latn",
            [
                "AM"
            ],
            "Nēhiyawēwin"
        ],
        "crg": [
            "Latn",
            [
                "AM"
            ],
            "Michif"
        ],
        "crh": [
            "Latn",
            [
                "EU"
            ],
            "qırımtatarca"
        ],
        "crh-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "къырымтатарджа"
        ],
        "crh-latn": [
            "crh"
        ],
        "crh-ro": [
            "Latn",
            [
                "EU"
            ],
            "tatarşa"
        ],
        "cs": [
            "Latn",
            [
                "EU"
            ],
            "čeština"
        ],
        "csb": [
            "Latn",
            [
                "EU"
            ],
            "kaszëbsczi"
        ],
        "cu": [
            "Cyrl",
            [
                "EU"
            ],
            "словѣньскъ \/ ⰔⰎⰑⰂⰡⰐⰠⰔⰍⰟ"
        ],
        "cv": [
            "Cyrl",
            [
                "EU"
            ],
            "чӑвашла"
        ],
        "cy": [
            "Latn",
            [
                "EU"
            ],
            "Cymraeg"
        ],
        "da": [
            "Latn",
            [
                "EU"
            ],
            "dansk"
        ],
        "dag": [
            "Latn",
            [
                "AF"
            ],
            "dagbanli"
        ],
        "dar": [
            "Cyrl",
            [
                "EU"
            ],
            "дарган"
        ],
        "ddn": [
            "Latn",
            [
                "AF"
            ],
            "dendi"
        ],
        "de": [
            "Latn",
            [
                "EU"
            ],
            "Deutsch"
        ],
        "de-at": [
            "Latn",
            [
                "EU"
            ],
            "Österreichisches Deutsch"
        ],
        "de-ch": [
            "Latn",
            [
                "EU"
            ],
            "Schweizer Hochdeutsch"
        ],
        "de-formal": [
            "Latn",
            [
                "EU"
            ],
            "Deutsch (Sie-Form)"
        ],
        "dga": [
            "Latn",
            [
                "AF"
            ],
            "Dagaare"
        ],
        "dik": [
            "din"
        ],
        "din": [
            "Latn",
            [
                "AF"
            ],
            "Thuɔŋjäŋ"
        ],
        "diq": [
            "Latn",
            [
                "EU",
                "AS"
            ],
            "Zazaki"
        ],
        "dlg": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "долган тыла"
        ],
        "doi": [
            "Deva",
            [
                "AS"
            ],
            "डोगरी"
        ],
        "dru": [
            "Latn",
            [
                "AS"
            ],
            "drekai"
        ],
        "dsb": [
            "Latn",
            [
                "EU"
            ],
            "dolnoserbski"
        ],
        "dso": [
            "Orya",
            [
                "AS"
            ],
            "ଦେଶିଆ"
        ],
        "dtp": [
            "Latn",
            [
                "AS"
            ],
            "Kadazandusun"
        ],
        "dty": [
            "Deva",
            [
                "AS"
            ],
            "डोटेली"
        ],
        "dua": [
            "Latn",
            [
                "AF"
            ],
            "Duálá"
        ],
        "dv": [
            "Thaa",
            [
                "AS"
            ],
            "ދިވެހިބަސް"
        ],
        "dyu": [
            "Latn",
            [
                "AF"
            ],
            "Julakan"
        ],
        "dz": [
            "Tibt",
            [
                "AS"
            ],
            "ཇོང་ཁ"
        ],
        "ee": [
            "Latn",
            [
                "AF"
            ],
            "eʋegbe"
        ],
        "efi": [
            "Latn",
            [
                "AF"
            ],
            "efịk"
        ],
        "egl": [
            "Latn",
            [
                "EU"
            ],
            "Emiliàn"
        ],
        "ekp": [
            "Latn",
            [
                "AF"
            ],
            "ẹkpeye"
        ],
        "el": [
            "Grek",
            [
                "EU"
            ],
            "Ελληνικά"
        ],
        "elm": [
            "Latn",
            [
                "AF"
            ],
            "Eleme"
        ],
        "eml": [
            "Latn",
            [
                "EU"
            ],
            "emiliàn e rumagnòl"
        ],
        "en": [
            "Latn",
            [
                "EU",
                "AM",
                "AF",
                "ME",
                "AS",
                "PA",
                "WW"
            ],
            "English"
        ],
        "en-ca": [
            "Latn",
            [
                "AM"
            ],
            "Canadian English"
        ],
        "en-gb": [
            "Latn",
            [
                "EU",
                "AS",
                "PA"
            ],
            "British English"
        ],
        "en-simple": [
            "Latn",
            [
                "WW"
            ],
            "Simple English"
        ],
        "en-us": [
            "Latn",
            [
                "AM"
            ],
            "American English"
        ],
        "eo": [
            "Latn",
            [
                "WW"
            ],
            "Esperanto"
        ],
        "es": [
            "Latn",
            [
                "EU",
                "AM",
                "AF",
                "WW",
                "PA"
            ],
            "español"
        ],
        "es-419": [
            "Latn",
            [
                "AM"
            ],
            "español de América Latina"
        ],
        "es-formal": [
            "Latn",
            [
                "EU",
                "AM",
                "AF",
                "WW"
            ],
            "español (formal)"
        ],
        "es-ni": [
            "Latn",
            [
                "AM"
            ],
            "español nicaragüense"
        ],
        "esu": [
            "Latn",
            [
                "AM"
            ],
            "Yup'ik"
        ],
        "et": [
            "Latn",
            [
                "EU"
            ],
            "eesti"
        ],
        "eu": [
            "Latn",
            [
                "EU"
            ],
            "euskara"
        ],
        "ext": [
            "Latn",
            [
                "EU"
            ],
            "estremeñu"
        ],
        "eya": [
            "Latn",
            [
                "AM"
            ],
            "I·ya·q"
        ],
        "fa": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "فارسی"
        ],
        "fan": [
            "Latn",
            [
                "AF"
            ],
            "Faŋ"
        ],
        "fat": [
            "Latn",
            [
                "AF"
            ],
            "mfantse"
        ],
        "fax": [
            "Latn",
            [
                "EU"
            ],
            "Fala"
        ],
        "ff": [
            "Latn",
            [
                "AF"
            ],
            "Fulfulde"
        ],
        "fi": [
            "Latn",
            [
                "EU"
            ],
            "suomi"
        ],
        "fil": [
            "tl"
        ],
        "fit": [
            "Latn",
            [
                "EU"
            ],
            "meänkieli"
        ],
        "fiu-vro": [
            "vro"
        ],
        "fj": [
            "Latn",
            [
                "PA"
            ],
            "Na Vosa Vakaviti"
        ],
        "fkv": [
            "Latn",
            [
                "EU"
            ],
            "kvääni"
        ],
        "fo": [
            "Latn",
            [
                "EU"
            ],
            "føroyskt"
        ],
        "fon": [
            "Latn",
            [
                "AF"
            ],
            "fɔ̀ngbè"
        ],
        "fr": [
            "Latn",
            [
                "EU",
                "AM",
                "WW"
            ],
            "français"
        ],
        "frc": [
            "Latn",
            [
                "AM"
            ],
            "français cadien"
        ],
        "frp": [
            "Latn",
            [
                "EU"
            ],
            "arpetan"
        ],
        "frr": [
            "Latn",
            [
                "EU"
            ],
            "Nordfriisk"
        ],
        "frs": [
            "Latn",
            [
                "EU"
            ],
            "Oostfräisk"
        ],
        "fuf": [
            "Latn",
            [
                "AF"
            ],
            "Fuuta Jalon"
        ],
        "fur": [
            "Latn",
            [
                "EU"
            ],
            "furlan"
        ],
        "fuv": [
            "ff"
        ],
        "fvr": [
            "Latn",
            [
                "AF"
            ],
            "poor’íŋ belé’ŋ"
        ],
        "fy": [
            "Latn",
            [
                "EU"
            ],
            "Frysk"
        ],
        "ga": [
            "Latn",
            [
                "EU"
            ],
            "Gaeilge"
        ],
        "gaa": [
            "Latn",
            [
                "AF"
            ],
            "Ga"
        ],
        "gag": [
            "Latn",
            [
                "EU"
            ],
            "Gagauz"
        ],
        "gah": [
            "Latn",
            [
                "AS"
            ],
            "Alekano"
        ],
        "gan": [
            "Hant",
            [
                "AS"
            ],
            "贛語"
        ],
        "gan-hans": [
            "Hans",
            [
                "AS"
            ],
            "赣语（简体）"
        ],
        "gan-hant": [
            "Hant",
            [
                "AS"
            ],
            "贛語（繁體）"
        ],
        "gaz": [
            "om"
        ],
        "gbm": [
            "Deva",
            [
                "AS"
            ],
            "गढ़वळि"
        ],
        "gbz": [
            "Latn",
            [
                "AS"
            ],
            "Dari-e Mazdeyasnā"
        ],
        "gcf": [
            "Latn",
            [
                "AM"
            ],
            "kréyòl Gwadloup"
        ],
        "gcr": [
            "Latn",
            [
                "AM"
            ],
            "kriyòl gwiyannen"
        ],
        "gd": [
            "Latn",
            [
                "EU"
            ],
            "Gàidhlig"
        ],
        "gdo": [
            "Cyrl",
            [
                "EU"
            ],
            "гъибдилӀи мицци"
        ],
        "gez": [
            "Ethi",
            [
                "AF"
            ],
            "ግዕዝ"
        ],
        "gju-arab": [
            "Arab",
            [
                "AS"
            ],
            "گوجری"
        ],
        "gju-deva": [
            "Deva",
            [
                "AS"
            ],
            "गुज्जरी"
        ],
        "gl": [
            "Latn",
            [
                "EU"
            ],
            "galego"
        ],
        "gld": [
            "Cyrl",
            [
                "AS"
            ],
            "на̄ни"
        ],
        "glk": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "گیلکی"
        ],
        "gn": [
            "Latn",
            [
                "AM"
            ],
            "Avañe'ẽ"
        ],
        "gom": [
            "gom-deva"
        ],
        "gom-deva": [
            "Deva",
            [
                "AS"
            ],
            "गोंयची कोंकणी"
        ],
        "gom-latn": [
            "Latn",
            [
                "AS"
            ],
            "Gõychi Konknni"
        ],
        "gor": [
            "Latn",
            [
                "AS"
            ],
            "Bahasa Hulontalo"
        ],
        "got": [
            "Goth",
            [
                "EU"
            ],
            "𐌲𐌿𐍄𐌹𐍃𐌺"
        ],
        "gpe": [
            "Latn",
            [
                "AF"
            ],
            "Ghanaian Pidgin"
        ],
        "grc": [
            "Grek",
            [
                "EU"
            ],
            "Ἀρχαία ἑλληνικὴ"
        ],
        "gsw": [
            "Latn",
            [
                "EU"
            ],
            "Alemannisch"
        ],
        "gu": [
            "Gujr",
            [
                "AS"
            ],
            "ગુજરાતી"
        ],
        "guc": [
            "Latn",
            [
                "AM"
            ],
            "wayuunaiki"
        ],
        "gum": [
            "Latn",
            [
                "AM"
            ],
            "Namtrik"
        ],
        "gur": [
            "Latn",
            [
                "AF"
            ],
            "farefare"
        ],
        "guw": [
            "Latn",
            [
                "AF"
            ],
            "gungbe"
        ],
        "gv": [
            "Latn",
            [
                "EU"
            ],
            "Gaelg"
        ],
        "ha": [
            "Latn",
            [
                "AF"
            ],
            "Hausa"
        ],
        "ha-arab": [
            "Arab",
            [
                "AF"
            ],
            "هَوُسَ"
        ],
        "ha-latn": [
            "ha"
        ],
        "hai": [
            "Latn",
            [
                "AM"
            ],
            "X̱aat Kíl"
        ],
        "hak": [
            "Hant",
            [
                "AS"
            ],
            "客家語 \/ Hak-kâ-ngî"
        ],
        "hak-hans": [
            "Hans",
            [
                "AS"
            ],
            "客家语（简体）"
        ],
        "hak-hant": [
            "Hant",
            [
                "AS"
            ],
            "客家語（繁體）"
        ],
        "hak-latn": [
            "Latn",
            [
                "AS"
            ],
            "Hak-kâ-ngî (Pha̍k-fa-sṳ)"
        ],
        "hav": [
            "Latn",
            [
                "AF"
            ],
            "Kihavu"
        ],
        "haw": [
            "Latn",
            [
                "AM",
                "PA"
            ],
            "Hawaiʻi"
        ],
        "he": [
            "Hebr",
            [
                "ME"
            ],
            "עברית"
        ],
        "hi": [
            "Deva",
            [
                "AS"
            ],
            "हिन्दी"
        ],
        "hif": [
            "Latn",
            [
                "PA",
                "AS"
            ],
            "Fiji Hindi"
        ],
        "hif-deva": [
            "Deva",
            [
                "AS"
            ],
            "फ़ीजी हिन्दी"
        ],
        "hif-latn": [
            "hif"
        ],
        "hil": [
            "Latn",
            [
                "AS"
            ],
            "Ilonggo"
        ],
        "hke": [
            "Latn",
            [
                "AF"
            ],
            "kihunde"
        ],
        "hne": [
            "Deva",
            [
                "AS"
            ],
            "छत्तीसगढ़ी"
        ],
        "hno": [
            "Arab",
            [
                "AS"
            ],
            "ہندکو"
        ],
        "ho": [
            "Latn",
            [
                "PA"
            ],
            "Hiri Motu"
        ],
        "hoc": [
            "Wara",
            [
                "AS"
            ],
            "𑢹𑣉𑣉"
        ],
        "hoc-latn": [
            "Latn",
            [
                "AS"
            ],
            "Ho"
        ],
        "hr": [
            "Latn",
            [
                "EU"
            ],
            "hrvatski"
        ],
        "hrx": [
            "Latn",
            [
                "AM"
            ],
            "Hunsrik"
        ],
        "hsb": [
            "Latn",
            [
                "EU"
            ],
            "hornjoserbsce"
        ],
        "hsn": [
            "Hant",
            [
                "AS"
            ],
            "湘語"
        ],
        "ht": [
            "Latn",
            [
                "AM"
            ],
            "Kreyòl ayisyen"
        ],
        "hu": [
            "Latn",
            [
                "EU"
            ],
            "magyar"
        ],
        "hu-formal": [
            "Latn",
            [
                "EU"
            ],
            "Magyar (magázó)"
        ],
        "hy": [
            "Armn",
            [
                "EU",
                "ME"
            ],
            "հայերեն"
        ],
        "hyw": [
            "Armn",
            [
                "EU",
                "ME"
            ],
            "Արեւմտահայերէն"
        ],
        "hz": [
            "Latn",
            [
                "AF"
            ],
            "Otsiherero"
        ],
        "ia": [
            "Latn",
            [
                "WW"
            ],
            "interlingua"
        ],
        "iba": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Jaku Iban"
        ],
        "ibb": [
            "Latn",
            [
                "AF"
            ],
            "ibibio"
        ],
        "id": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Bahasa Indonesia"
        ],
        "ie": [
            "Latn",
            [
                "WW"
            ],
            "Interlingue"
        ],
        "ig": [
            "Latn",
            [
                "AF"
            ],
            "Igbo"
        ],
        "igb": [
            "Latn",
            [
                "AF"
            ],
            "Ebira"
        ],
        "igl": [
            "Latn",
            [
                "AF"
            ],
            "Igala"
        ],
        "ii": [
            "Yiii",
            [
                "AS"
            ],
            "ꆇꉙ"
        ],
        "ik": [
            "Latn",
            [
                "AM"
            ],
            "Iñupiatun"
        ],
        "ike-cans": [
            "Cans",
            [
                "AM"
            ],
            "ᐃᓄᒃᑎᑐᑦ"
        ],
        "ike-latn": [
            "Latn",
            [
                "AM"
            ],
            "inuktitut"
        ],
        "ilo": [
            "Latn",
            [
                "AS"
            ],
            "Ilokano"
        ],
        "inh": [
            "Cyrl",
            [
                "EU"
            ],
            "гӀалгӀай"
        ],
        "io": [
            "Latn",
            [
                "WW"
            ],
            "Ido"
        ],
        "is": [
            "Latn",
            [
                "EU"
            ],
            "íslenska"
        ],
        "ish": [
            "Latn",
            [
                "AF"
            ],
            "awain"
        ],
        "isv": [
            "isv-latn"
        ],
        "isv-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "меджусловјанскы"
        ],
        "isv-latn": [
            "Latn",
            [
                "EU"
            ],
            "medžuslovjansky"
        ],
        "it": [
            "Latn",
            [
                "EU"
            ],
            "italiano"
        ],
        "iu": [
            "ike-cans"
        ],
        "izh": [
            "Latn",
            [
                "EU"
            ],
            "ižoran keel"
        ],
        "izr": [
            "Latn",
            [
                "AF"
            ],
            "Izere"
        ],
        "ja": [
            "Jpan",
            [
                "AS"
            ],
            "日本語"
        ],
        "jab": [
            "Latn",
            [
                "AF"
            ],
            "Hyam"
        ],
        "jac": [
            "Latn",
            [
                "AM"
            ],
            "Abꞌxubꞌal Poptiꞌ"
        ],
        "jam": [
            "Latn",
            [
                "AM"
            ],
            "Patois"
        ],
        "jax": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Jambi"
        ],
        "jbo": [
            "Latn",
            [
                "WW"
            ],
            "lojban"
        ],
        "jdt": [
            "jdt-cyrl"
        ],
        "jdt-cyrl": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "жугьури"
        ],
        "jje": [
            "Kore",
            [
                "AS"
            ],
            "제주말"
        ],
        "juk": [
            "Latn",
            [
                "AF"
            ],
            "Nene Wapan"
        ],
        "jut": [
            "Latn",
            [
                "EU"
            ],
            "jysk"
        ],
        "jv": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Jawa"
        ],
        "jv-java": [
            "Java",
            [
                "AS",
                "PA"
            ],
            "ꦗꦮ"
        ],
        "ka": [
            "Geor",
            [
                "EU"
            ],
            "ქართული"
        ],
        "kaa": [
            "Latn",
            [
                "AS"
            ],
            "Qaraqalpaqsha"
        ],
        "kab": [
            "Latn",
            [
                "AF",
                "EU"
            ],
            "Taqbaylit"
        ],
        "kac": [
            "Latn",
            [
                "AS"
            ],
            "Jinghpaw"
        ],
        "kai": [
            "Latn",
            [
                "AF"
            ],
            "Karai-karai"
        ],
        "kaj": [
            "Latn",
            [
                "AF"
            ],
            "Jju"
        ],
        "kam": [
            "Latn",
            [
                "AF"
            ],
            "kĩkamba"
        ],
        "kbd": [
            "Cyrl",
            [
                "EU",
                "ME"
            ],
            "адыгэбзэ"
        ],
        "kbd-cyrl": [
            "kbd"
        ],
        "kbd-latn": [
            "Latn",
            [
                "EU"
            ],
            "Qabardjajəbza"
        ],
        "kbp": [
            "Latn",
            [
                "AF"
            ],
            "Kabɩyɛ"
        ],
        "kcg": [
            "Latn",
            [
                "AF"
            ],
            "Tyap"
        ],
        "kck": [
            "Latn",
            [
                "AF"
            ],
            "tjikalanga"
        ],
        "kea": [
            "Latn",
            [
                "AF"
            ],
            "kabuverdianu"
        ],
        "ken": [
            "Latn",
            [
                "AF"
            ],
            "kɛ́nyáŋ"
        ],
        "kg": [
            "Latn",
            [
                "AF"
            ],
            "Kongo"
        ],
        "kge": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Kumoring"
        ],
        "kge-arab": [
            "Arab",
            [
                "AS",
                "PA"
            ],
            "كوموريڠ"
        ],
        "kgg": [
            "Deva",
            [
                "AS"
            ],
            "गेम्येहाक़ गिपन"
        ],
        "kgp": [
            "Latn",
            [
                "AM"
            ],
            "Kaingáng"
        ],
        "kha": [
            "Latn",
            [
                "AS"
            ],
            "Khasi"
        ],
        "khk": [
            "mn"
        ],
        "khw": [
            "Arab",
            [
                "ME",
                "AS"
            ],
            "کھوار"
        ],
        "ki": [
            "Latn",
            [
                "AF"
            ],
            "Gĩkũyũ"
        ],
        "kip": [
            "Deva",
            [
                "AS"
            ],
            "शेषी पाङ"
        ],
        "kiu": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "Kırmancki"
        ],
        "kix": [
            "Latn",
            [
                "AS"
            ],
            "Khiamniungan"
        ],
        "kj": [
            "Latn",
            [
                "AF"
            ],
            "Kwanyama"
        ],
        "kjh": [
            "Cyrl",
            [
                "AS"
            ],
            "хакас"
        ],
        "kjp": [
            "Mymr",
            [
                "AS"
            ],
            "ဖၠုံလိက်"
        ],
        "kk": [
            "kk-cyrl"
        ],
        "kk-arab": [
            "Arab",
            [
                "EU",
                "AS"
            ],
            "قازاقشا (تٶتە)"
        ],
        "kk-cn": [
            "kk-arab"
        ],
        "kk-cyrl": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "қазақша"
        ],
        "kk-kz": [
            "kk-cyrl"
        ],
        "kk-latn": [
            "Latn",
            [
                "EU",
                "AS",
                "ME"
            ],
            "qazaqşa"
        ],
        "kk-tr": [
            "kk-latn"
        ],
        "kl": [
            "Latn",
            [
                "AM",
                "EU"
            ],
            "kalaallisut"
        ],
        "km": [
            "Khmr",
            [
                "AS"
            ],
            "ភាសាខ្មែរ"
        ],
        "kmb": [
            "Latn",
            [
                "AF"
            ],
            "kimbundu"
        ],
        "kmr": [
            "ku-latn"
        ],
        "kn": [
            "Knda",
            [
                "AS"
            ],
            "ಕನ್ನಡ"
        ],
        "knc": [
            "Latn",
            [
                "AF"
            ],
            "Yerwa Kanuri"
        ],
        "knn": [
            "Deva",
            [
                "AS"
            ],
            "महाराष्ट्रीय कोंकणी"
        ],
        "ko": [
            "Kore",
            [
                "AS"
            ],
            "한국어"
        ],
        "ko-kp": [
            "Kore",
            [
                "AS"
            ],
            "조선말"
        ],
        "koi": [
            "Cyrl",
            [
                "EU"
            ],
            "перем коми"
        ],
        "koy": [
            "Latn",
            [
                "AM"
            ],
            "Denaakkenaageʼ"
        ],
        "kqr": [
            "Latn",
            [
                "AS"
            ],
            "Kimaragang"
        ],
        "kr": [
            "Latn",
            [
                "AF"
            ],
            "kanuri"
        ],
        "krc": [
            "Cyrl",
            [
                "EU"
            ],
            "къарачай-малкъар"
        ],
        "kri": [
            "Latn",
            [
                "AF"
            ],
            "Krio"
        ],
        "krj": [
            "Latn",
            [
                "AS"
            ],
            "Kinaray-a"
        ],
        "krl": [
            "Latn",
            [
                "EU"
            ],
            "Karjala"
        ],
        "ks": [
            "Arab",
            [
                "AS"
            ],
            "کٲشُر"
        ],
        "ks-arab": [
            "ks"
        ],
        "ks-deva": [
            "Deva",
            [
                "AS"
            ],
            "कॉशुर"
        ],
        "ksf": [
            "Latn",
            [
                "AF"
            ],
            "Bafia"
        ],
        "ksh": [
            "Latn",
            [
                "EU"
            ],
            "Ripoarisch"
        ],
        "ksw": [
            "Mymr",
            [
                "AS"
            ],
            "စှီၤ"
        ],
        "ku": [
            "ku-latn"
        ],
        "ku-arab": [
            "Arab",
            [
                "EU",
                "ME"
            ],
            "کوردی (عەرەبی)"
        ],
        "ku-latn": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "kurdî"
        ],
        "kum": [
            "Cyrl",
            [
                "EU"
            ],
            "къумукъ"
        ],
        "kus": [
            "Latn",
            [
                "AF"
            ],
            "Kʋsaal"
        ],
        "kv": [
            "Cyrl",
            [
                "EU"
            ],
            "коми"
        ],
        "kw": [
            "Latn",
            [
                "EU"
            ],
            "kernowek"
        ],
        "ky": [
            "Cyrl",
            [
                "AS"
            ],
            "кыргызча"
        ],
        "la": [
            "Latn",
            [
                "EU"
            ],
            "Latina"
        ],
        "lad": [
            "lad-latn"
        ],
        "lad-hebr": [
            "Hebr",
            [
                "ME",
                "EU",
                "AM"
            ],
            "לאדינו"
        ],
        "lad-latn": [
            "Latn",
            [
                "ME",
                "EU",
                "AM"
            ],
            "Ladino"
        ],
        "lag": [
            "Latn",
            [
                "AF"
            ],
            "Kilaangi"
        ],
        "laj": [
            "Latn",
            [
                "AF"
            ],
            "Lëblaŋo"
        ],
        "lb": [
            "Latn",
            [
                "EU"
            ],
            "Lëtzebuergesch"
        ],
        "lbe": [
            "Cyrl",
            [
                "EU"
            ],
            "лакку"
        ],
        "ldn": [
            "Latn",
            [
                "WW"
            ],
            "Láadan"
        ],
        "lez": [
            "Cyrl",
            [
                "EU"
            ],
            "лезги"
        ],
        "lfn": [
            "Latn",
            [
                "WW"
            ],
            "Lingua Franca Nova"
        ],
        "lg": [
            "Latn",
            [
                "AF"
            ],
            "Luganda"
        ],
        "li": [
            "Latn",
            [
                "EU"
            ],
            "Limburgs"
        ],
        "lij": [
            "Latn",
            [
                "EU"
            ],
            "Ligure"
        ],
        "lij-mc": [
            "Latn",
            [
                "EU"
            ],
            "munegascu"
        ],
        "liv": [
            "Latn",
            [
                "EU"
            ],
            "Līvõ kēļ"
        ],
        "ljp": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Lampung Api"
        ],
        "lki": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "لەکی"
        ],
        "lkt": [
            "Latn",
            [
                "AM"
            ],
            "Lakȟótiyapi"
        ],
        "lld": [
            "Latn",
            [
                "EU"
            ],
            "Ladin"
        ],
        "lmo": [
            "Latn",
            [
                "EU"
            ],
            "lombard"
        ],
        "ln": [
            "Latn",
            [
                "AF"
            ],
            "lingála"
        ],
        "lo": [
            "Laoo",
            [
                "AS"
            ],
            "ລາວ"
        ],
        "lou": [
            "Latn",
            [
                "AM"
            ],
            "Kouri-Vini"
        ],
        "loz": [
            "Latn",
            [
                "AF"
            ],
            "Silozi"
        ],
        "lrc": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "لۊری شومالی"
        ],
        "lt": [
            "Latn",
            [
                "EU"
            ],
            "lietuvių"
        ],
        "ltg": [
            "Latn",
            [
                "EU"
            ],
            "latgaļu"
        ],
        "lua": [
            "Latn",
            [
                "AF"
            ],
            "ciluba"
        ],
        "lud": [
            "Latn",
            [
                "EU"
            ],
            "lüüdi"
        ],
        "lue": [
            "Latn",
            [
                "AF"
            ],
            "chiluvale"
        ],
        "luo": [
            "Latn",
            [
                "AF"
            ],
            "dholuo"
        ],
        "lus": [
            "Latn",
            [
                "AS"
            ],
            "Mizo ţawng"
        ],
        "lut": [
            "Latn",
            [
                "AM"
            ],
            "dxʷləšucid"
        ],
        "luz": [
            "Arab",
            [
                "ME"
            ],
            "لئری دوٙمینی"
        ],
        "lv": [
            "Latn",
            [
                "EU"
            ],
            "latviešu"
        ],
        "lvs": [
            "lv"
        ],
        "lzh": [
            "Hant",
            [
                "AS"
            ],
            "文言"
        ],
        "lzz": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "Lazuri"
        ],
        "mad": [
            "Latn",
            [
                "AS"
            ],
            "Madhurâ"
        ],
        "mag": [
            "Deva",
            [
                "AS"
            ],
            "मगही"
        ],
        "mai": [
            "Deva",
            [
                "AS"
            ],
            "मैथिली"
        ],
        "mak": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Mangkasarak"
        ],
        "mak-bugi": [
            "Bugi",
            [
                "AS",
                "PA"
            ],
            "ᨆᨀᨔᨑ"
        ],
        "map-bms": [
            "Latn",
            [
                "AS"
            ],
            "Basa Banyumasan"
        ],
        "maw": [
            "Latn",
            [
                "AF"
            ],
            "Ŋmampulli"
        ],
        "mcn": [
            "Latn",
            [
                "AF"
            ],
            "vùn màsànà"
        ],
        "mdf": [
            "Cyrl",
            [
                "EU"
            ],
            "мокшень"
        ],
        "mdh": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Magindanawn"
        ],
        "mey": [
            "Arab",
            [
                "AF"
            ],
            "الحسانية"
        ],
        "mfa": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Klate-Ttaning"
        ],
        "mfe": [
            "Latn",
            [
                "AM"
            ],
            "Morisyen"
        ],
        "mg": [
            "Latn",
            [
                "AF"
            ],
            "Malagasy"
        ],
        "mh": [
            "Latn",
            [
                "PA"
            ],
            "Ebon"
        ],
        "mhr": [
            "Cyrl",
            [
                "EU"
            ],
            "олык марий"
        ],
        "mi": [
            "Latn",
            [
                "PA"
            ],
            "Māori"
        ],
        "mic": [
            "Latn",
            [
                "AM"
            ],
            "Mi'kmaq"
        ],
        "min": [
            "Latn",
            [
                "AS"
            ],
            "Minangkabau"
        ],
        "miq": [
            "Latn",
            [
                "AM"
            ],
            "Mískitu"
        ],
        "mk": [
            "Cyrl",
            [
                "EU"
            ],
            "македонски"
        ],
        "ml": [
            "Mlym",
            [
                "AS",
                "ME"
            ],
            "മലയാളം"
        ],
        "mn": [
            "Cyrl",
            [
                "AS"
            ],
            "монгол"
        ],
        "mn-cyrl": [
            "mn"
        ],
        "mn-mong": [
            "mvf"
        ],
        "mnc": [
            "Latn",
            [
                "AS"
            ],
            "manju gisun"
        ],
        "mnc-latn": [
            "mnc"
        ],
        "mnc-mong": [
            "Mong",
            [
                "AS"
            ],
            "ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ"
        ],
        "mni": [
            "Mtei",
            [
                "AS"
            ],
            "ꯃꯤꯇꯩ ꯂꯣꯟ"
        ],
        "mni-beng": [
            "Beng",
            [
                "AS"
            ],
            "মেইতেই লোন্"
        ],
        "mns": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "ма̄ньси"
        ],
        "mnw": [
            "Mymr",
            [
                "AS"
            ],
            "ဘာသာမန်"
        ],
        "mo": [
            "Cyrl",
            [
                "EU"
            ],
            "молдовеняскэ"
        ],
        "moe": [
            "Latn",
            [
                "AM"
            ],
            "innu-aimun"
        ],
        "mos": [
            "Latn",
            [
                "AF"
            ],
            "moore"
        ],
        "mr": [
            "Deva",
            [
                "AS",
                "ME"
            ],
            "मराठी"
        ],
        "mrh": [
            "Latn",
            [
                "AS"
            ],
            "Mara"
        ],
        "mrj": [
            "Cyrl",
            [
                "EU"
            ],
            "кырык мары"
        ],
        "mrt": [
            "Latn",
            [
                "AF"
            ],
            "Margi"
        ],
        "mrv": [
            "Latn",
            [
                "PA"
            ],
            "Magareva"
        ],
        "ms": [
            "Latn",
            [
                "AS"
            ],
            "Bahasa Melayu"
        ],
        "ms-arab": [
            "Arab",
            [
                "AS"
            ],
            "بهاس ملايو"
        ],
        "msi": [
            "Latn",
            [
                "AS"
            ],
            "Bahasa Sabah"
        ],
        "mt": [
            "Latn",
            [
                "EU"
            ],
            "Malti"
        ],
        "mui": [
            "Latn",
            [
                "AS"
            ],
            "Baso Palembang"
        ],
        "mus": [
            "Latn",
            [
                "AM"
            ],
            "Mvskoke"
        ],
        "mvf": [
            "Mong",
            [
                "AS"
            ],
            "ᠮᠣᠩᠭᠣᠯ"
        ],
        "mwl": [
            "Latn",
            [
                "EU"
            ],
            "Mirandés"
        ],
        "mwv": [
            "Latn",
            [
                "AS"
            ],
            "Behase Mentawei"
        ],
        "mww": [
            "mww-latn"
        ],
        "mww-latn": [
            "Latn",
            [
                "AS"
            ],
            "Hmoob Dawb"
        ],
        "my": [
            "Mymr",
            [
                "AS"
            ],
            "မြန်မာဘာသာ"
        ],
        "myv": [
            "Cyrl",
            [
                "EU"
            ],
            "эрзянь"
        ],
        "mzn": [
            "Arab",
            [
                "ME",
                "AS"
            ],
            "مازِرونی"
        ],
        "na": [
            "Latn",
            [
                "PA"
            ],
            "Dorerin Naoero"
        ],
        "nah": [
            "Latn",
            [
                "AM"
            ],
            "Nāhuatl"
        ],
        "nan": [
            "Latn",
            [
                "AS"
            ],
            "閩南語 \/ Bân-lâm-gí"
        ],
        "nan-hani": [
            "Hani",
            [
                "AS"
            ],
            "閩南語（漢字）"
        ],
        "nan-hans": [
            "Hans",
            [
                "AS"
            ],
            "闽南语（简化汉字）"
        ],
        "nan-hant": [
            "Hant",
            [
                "AS"
            ],
            "閩南語（傳統漢字）"
        ],
        "nan-latn": [
            "Latn",
            [
                "AS"
            ],
            "Bân-lâm-gí (Lô-má-jī)"
        ],
        "nan-latn-pehoeji": [
            "Latn",
            [
                "AS"
            ],
            "Bân-lâm-gí (Pe̍h-ōe-jī)"
        ],
        "nan-latn-tailo": [
            "Latn",
            [
                "AS"
            ],
            "Bân-lâm-gí (Tâi-lô)"
        ],
        "nap": [
            "Latn",
            [
                "EU"
            ],
            "Napulitano"
        ],
        "naq": [
            "Latn",
            [
                "AF"
            ],
            "Khoekhoegowab"
        ],
        "nb": [
            "Latn",
            [
                "EU"
            ],
            "norsk (bokmål)"
        ],
        "nd": [
            "Latn",
            [
                "AF"
            ],
            "siNdebele saseNyakatho"
        ],
        "nds": [
            "Latn",
            [
                "EU"
            ],
            "Plattdüütsch"
        ],
        "nds-nl": [
            "Latn",
            [
                "EU"
            ],
            "Nedersaksisch"
        ],
        "ne": [
            "Deva",
            [
                "AS"
            ],
            "नेपाली"
        ],
        "new": [
            "Deva",
            [
                "AS"
            ],
            "नेपाल भाषा"
        ],
        "ng": [
            "Latn",
            [
                "AF"
            ],
            "Oshiwambo"
        ],
        "nia": [
            "Latn",
            [
                "AS"
            ],
            "Li Niha"
        ],
        "nit": [
            "Telu",
            [
                "AS"
            ],
            "కొలామి"
        ],
        "niu": [
            "Latn",
            [
                "PA"
            ],
            "ko e vagahau Niuē"
        ],
        "njo": [
            "Latn",
            [
                "AS"
            ],
            "Ao"
        ],
        "nl": [
            "Latn",
            [
                "EU",
                "AM"
            ],
            "Nederlands"
        ],
        "nl-informal": [
            "Latn",
            [
                "EU",
                "AM"
            ],
            "Nederlands (informeel)"
        ],
        "nmz": [
            "Latn",
            [
                "AF"
            ],
            "nawdm"
        ],
        "nn": [
            "Latn",
            [
                "EU"
            ],
            "norsk (nynorsk)"
        ],
        "nn-hognorsk": [
            "Latn",
            [
                "EU"
            ],
            "norsk (høgnorsk)"
        ],
        "nnh": [
            "Latn",
            [
                "AF"
            ],
            "ngiembɔɔn"
        ],
        "no": [
            "Latn",
            [
                "EU"
            ],
            "norsk"
        ],
        "nod": [
            "Lana",
            [
                "AS"
            ],
            "ᨣᩴᩤᨾᩮᩥᩬᨦ"
        ],
        "nod-thai": [
            "Thai",
            [
                "AS"
            ],
            "คำเมือง"
        ],
        "nog": [
            "Cyrl",
            [
                "EU"
            ],
            "ногайша"
        ],
        "nov": [
            "Latn",
            [
                "WW"
            ],
            "Novial"
        ],
        "npi": [
            "ne"
        ],
        "nqo": [
            "Nkoo",
            [
                "AF"
            ],
            "ߒߞߏ"
        ],
        "nr": [
            "Latn",
            [
                "AF"
            ],
            "isiNdebele seSewula"
        ],
        "nrf-gg": [
            "Latn",
            [
                "EU"
            ],
            "Guernésiais"
        ],
        "nrf-je": [
            "Latn",
            [
                "EU"
            ],
            "Jèrriais"
        ],
        "nrm": [
            "Latn",
            [
                "EU"
            ],
            "Nouormand"
        ],
        "nso": [
            "Latn",
            [
                "AF"
            ],
            "Sesotho sa Leboa"
        ],
        "nup": [
            "Latn",
            [
                "AF"
            ],
            "Nupe"
        ],
        "nus": [
            "Latn",
            [
                "AF"
            ],
            "Thok Naath"
        ],
        "nv": [
            "Latn",
            [
                "AM"
            ],
            "Diné bizaad"
        ],
        "ny": [
            "Latn",
            [
                "AF"
            ],
            "Chi-Chewa"
        ],
        "nyn": [
            "Latn",
            [
                "AF"
            ],
            "runyankore"
        ],
        "nyo": [
            "Latn",
            [
                "AF"
            ],
            "Orunyoro"
        ],
        "nys": [
            "Latn",
            [
                "PA"
            ],
            "Nyungar"
        ],
        "nzi": [
            "Latn",
            [
                "AF"
            ],
            "Nzema"
        ],
        "oc": [
            "Latn",
            [
                "EU"
            ],
            "occitan"
        ],
        "ojb": [
            "Latn",
            [
                "AM"
            ],
            "Ojibwemowin"
        ],
        "oka": [
            "Latn",
            [
                "AM"
            ],
            "n̓səl̓xcin̓"
        ],
        "olo": [
            "Latn",
            [
                "EU"
            ],
            "livvinkarjala"
        ],
        "om": [
            "Latn",
            [
                "AF"
            ],
            "Oromoo"
        ],
        "ood": [
            "Latn",
            [
                "AM"
            ],
            "ʼOʼodham ha-ñeʼokĭ"
        ],
        "or": [
            "Orya",
            [
                "AS"
            ],
            "ଓଡ଼ିଆ"
        ],
        "ory": [
            "or"
        ],
        "os": [
            "Cyrl",
            [
                "EU"
            ],
            "ирон"
        ],
        "osi": [
            "Latn",
            [
                "AS"
            ],
            "Using"
        ],
        "ota": [
            "Arab",
            [
                "AS",
                "EU"
            ],
            "لسان عثمانى"
        ],
        "ovd": [
            "Latn",
            [
                "EU"
            ],
            "övdalsk"
        ],
        "pa": [
            "Guru",
            [
                "AS"
            ],
            "ਪੰਜਾਬੀ"
        ],
        "pa-arab": [
            "pnb"
        ],
        "pa-guru": [
            "pa"
        ],
        "pag": [
            "Latn",
            [
                "AS"
            ],
            "Pangasinan"
        ],
        "pam": [
            "Latn",
            [
                "AS"
            ],
            "Kapampangan"
        ],
        "pap": [
            "Latn",
            [
                "AM"
            ],
            "Papiamentu"
        ],
        "pap-aw": [
            "Latn",
            [
                "AM"
            ],
            "Papiamento (Aruba)"
        ],
        "pbb": [
            "Latn",
            [
                "AM"
            ],
            "Nasa Yuwe"
        ],
        "pbt": [
            "ps"
        ],
        "pcd": [
            "Latn",
            [
                "EU"
            ],
            "Picard"
        ],
        "pcm": [
            "Latn",
            [
                "AF"
            ],
            "Naijá"
        ],
        "pdc": [
            "Latn",
            [
                "EU",
                "AM"
            ],
            "Deitsch"
        ],
        "pdt": [
            "Latn",
            [
                "EU",
                "AM"
            ],
            "Plautdietsch"
        ],
        "pes": [
            "fa"
        ],
        "pey": [
            "Latn",
            [
                "EU",
                "PA",
                "AS"
            ],
            "Petjoh"
        ],
        "pfl": [
            "Latn",
            [
                "EU"
            ],
            "Pälzisch"
        ],
        "phr": [
            "Arab",
            [
                "AS"
            ],
            "پوٹھواری"
        ],
        "pi": [
            "Deva",
            [
                "AS"
            ],
            "पालि"
        ],
        "pih": [
            "Latn",
            [
                "PA"
            ],
            "Norfuk \/ Pitkern"
        ],
        "pis": [
            "Latn",
            [
                "PA"
            ],
            "Solomon Aelan Pijin"
        ],
        "piu": [
            "Latn",
            [
                "PA"
            ],
            "Pintupi-Luritja"
        ],
        "pjt": [
            "Latn",
            [
                "PA"
            ],
            "Pitjantjatjara"
        ],
        "pko": [
            "Latn",
            [
                "AF"
            ],
            "Pökoot"
        ],
        "pl": [
            "Latn",
            [
                "EU"
            ],
            "polski"
        ],
        "plt": [
            "mg"
        ],
        "pms": [
            "Latn",
            [
                "EU"
            ],
            "Piemontèis"
        ],
        "pnb": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "پنجابی"
        ],
        "pnt": [
            "Grek",
            [
                "EU"
            ],
            "Ποντιακά"
        ],
        "pov": [
            "Latn",
            [
                "AF"
            ],
            "guinensi"
        ],
        "ppl": [
            "Latn",
            [
                "AM"
            ],
            "Nawat"
        ],
        "prg": [
            "Latn",
            [
                "EU"
            ],
            "Prūsiskan"
        ],
        "prs": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "دری"
        ],
        "ps": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "پښتو"
        ],
        "pt": [
            "Latn",
            [
                "EU",
                "AM",
                "AS",
                "PA",
                "AF",
                "WW"
            ],
            "português"
        ],
        "pt-br": [
            "Latn",
            [
                "AM"
            ],
            "português do Brasil"
        ],
        "pwn": [
            "Latn",
            [
                "AS"
            ],
            "pinayuanan"
        ],
        "pwo": [
            "Mymr",
            [
                "AS"
            ],
            "ဖျိၩ့ၡိ"
        ],
        "pzh": [
            "Latn",
            [
                "AS"
            ],
            "Pazeh"
        ],
        "qu": [
            "Latn",
            [
                "AM"
            ],
            "Runa Simi"
        ],
        "quc": [
            "Latn",
            [
                "AM"
            ],
            "K'iche'"
        ],
        "qug": [
            "Latn",
            [
                "AM"
            ],
            "Runa shimi"
        ],
        "quy": [
            "qu"
        ],
        "qwh": [
            "Latn",
            [
                "AM"
            ],
            "anqash qichwa"
        ],
        "qxp": [
            "Latn",
            [
                "AM"
            ],
            "Punu qhichwa"
        ],
        "rag": [
            "Latn",
            [
                "AF"
            ],
            "Lologooli"
        ],
        "raj": [
            "Deva",
            [
                "AS"
            ],
            "राजस्थानी"
        ],
        "rap": [
            "Latn",
            [
                "PA",
                "AM"
            ],
            "arero rapa nui"
        ],
        "rcf": [
            "Latn",
            [
                "AF"
            ],
            "Kreol Réyoné"
        ],
        "rej": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Jang"
        ],
        "rgn": [
            "Latn",
            [
                "EU"
            ],
            "Rumagnôl"
        ],
        "rhg": [
            "Rohg",
            [
                "AS"
            ],
            "𐴌𐴟𐴇𐴥𐴝𐴚𐴒𐴙𐴝"
        ],
        "rhg-arab": [
            "Arab",
            [
                "AS"
            ],
            "رُحَ࣪ڠۡگَ࣪ࢬ عَرࣤبِي لࣦكَ࣪"
        ],
        "rhg-rohg": [
            "rhg"
        ],
        "rif": [
            "Latn",
            [
                "AF"
            ],
            "Tarifit"
        ],
        "rki": [
            "Mymr",
            [
                "AS"
            ],
            "ရခိုင်"
        ],
        "rm": [
            "Latn",
            [
                "EU"
            ],
            "rumantsch"
        ],
        "rm-puter": [
            "Latn",
            [
                "EU"
            ],
            "puter"
        ],
        "rm-rumgr": [
            "Latn",
            [
                "EU"
            ],
            "rumantsch grischun"
        ],
        "rm-surmiran": [
            "Latn",
            [
                "EU"
            ],
            "surmiran"
        ],
        "rm-sursilv": [
            "Latn",
            [
                "EU"
            ],
            "sursilvan"
        ],
        "rm-sutsilv": [
            "Latn",
            [
                "EU"
            ],
            "sutsilvan"
        ],
        "rm-vallader": [
            "Latn",
            [
                "EU"
            ],
            "vallader"
        ],
        "rmc": [
            "Latn",
            [
                "EU"
            ],
            "romaňi čhib"
        ],
        "rmf": [
            "Latn",
            [
                "EU"
            ],
            "kaalengo tšimb"
        ],
        "rml-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "романы"
        ],
        "rmy": [
            "Latn",
            [
                "EU"
            ],
            "Romani"
        ],
        "rn": [
            "Latn",
            [
                "AF"
            ],
            "ikirundi"
        ],
        "ro": [
            "Latn",
            [
                "EU"
            ],
            "română"
        ],
        "roa-rup": [
            "rup"
        ],
        "roa-tara": [
            "Latn",
            [
                "EU"
            ],
            "tarandíne"
        ],
        "rsk": [
            "Cyrl",
            [
                "EU"
            ],
            "руски"
        ],
        "rtm": [
            "Latn",
            [
                "PA"
            ],
            "Faeag Rotuma"
        ],
        "ru": [
            "Cyrl",
            [
                "EU",
                "AS",
                "ME"
            ],
            "русский"
        ],
        "rue": [
            "Cyrl",
            [
                "EU"
            ],
            "русиньскый"
        ],
        "rup": [
            "Latn",
            [
                "EU"
            ],
            "armãneashti"
        ],
        "ruq": [
            "Cyrl",
            [
                "EU"
            ],
            "Влахесте"
        ],
        "ruq-cyrl": [
            "ruq"
        ],
        "ruq-latn": [
            "Latn",
            [
                "EU"
            ],
            "Vlăheşte"
        ],
        "rut": [
            "Cyrl",
            [
                "EU"
            ],
            "мыхаӀбишды"
        ],
        "rw": [
            "Latn",
            [
                "AF"
            ],
            "Ikinyarwanda"
        ],
        "rwr": [
            "Deva",
            [
                "AS"
            ],
            "मारवाड़ी"
        ],
        "ryu": [
            "Jpan",
            [
                "AS"
            ],
            "うちなーぐち"
        ],
        "sa": [
            "Deva",
            [
                "AS"
            ],
            "संस्कृतम्"
        ],
        "sah": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "саха тыла"
        ],
        "sas": [
            "Latn",
            [
                "AS"
            ],
            "Sasak"
        ],
        "sat": [
            "Olck",
            [
                "AS"
            ],
            "ᱥᱟᱱᱛᱟᱲᱤ"
        ],
        "saz": [
            "Saur",
            [
                "AS"
            ],
            "ꢱꣃꢬꢵꢯ꣄ꢡ꣄ꢬꢵ"
        ],
        "sc": [
            "Latn",
            [
                "EU"
            ],
            "sardu"
        ],
        "scn": [
            "Latn",
            [
                "EU"
            ],
            "sicilianu"
        ],
        "sco": [
            "Latn",
            [
                "EU"
            ],
            "Scots"
        ],
        "sd": [
            "Arab",
            [
                "AS"
            ],
            "سنڌي"
        ],
        "sd-arab": [
            "sd"
        ],
        "sd-deva": [
            "Deva",
            [
                "AS"
            ],
            "सिंधी"
        ],
        "sd-sind": [
            "Sind",
            [
                "AS"
            ],
            "𑋝𑋡𑋟𑋐𑋢"
        ],
        "sdc": [
            "Latn",
            [
                "EU"
            ],
            "Sassaresu"
        ],
        "sdh": [
            "Arab",
            [
                "ME"
            ],
            "کوردی خوارگ"
        ],
        "se": [
            "Latn",
            [
                "EU"
            ],
            "davvisámegiella"
        ],
        "se-fi": [
            "Latn",
            [
                "EU"
            ],
            "davvisámegiella (Suoma bealde)"
        ],
        "se-no": [
            "Latn",
            [
                "EU"
            ],
            "davvisámegiella (Norgga bealde)"
        ],
        "se-se": [
            "Latn",
            [
                "EU"
            ],
            "davvisámegiella (Ruoŧa bealde)"
        ],
        "sei": [
            "Latn",
            [
                "AM"
            ],
            "Cmique Itom"
        ],
        "ses": [
            "Latn",
            [
                "AF"
            ],
            "Koyraboro Senni"
        ],
        "sg": [
            "Latn",
            [
                "AF"
            ],
            "Sängö"
        ],
        "sgh": [
            "Latn",
            [
                "AS"
            ],
            "xuɣ̌nůni"
        ],
        "sgs": [
            "Latn",
            [
                "EU"
            ],
            "žemaitėška"
        ],
        "sh": [
            "Latn",
            [
                "EU"
            ],
            "srpskohrvatski \/ српскохрватски"
        ],
        "sh-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "српскохрватски"
        ],
        "sh-latn": [
            "Latn",
            [
                "EU"
            ],
            "srpskohrvatski"
        ],
        "shi": [
            "shi-latn"
        ],
        "shi-latn": [
            "Latn",
            [
                "AF"
            ],
            "Taclḥit"
        ],
        "shi-tfng": [
            "Tfng",
            [
                "AF"
            ],
            "ⵜⴰⵛⵍⵃⵉⵜ"
        ],
        "shn": [
            "Mymr",
            [
                "AS"
            ],
            "တႆး"
        ],
        "shy": [
            "shy-latn"
        ],
        "shy-latn": [
            "Latn",
            [
                "AF"
            ],
            "tacawit"
        ],
        "si": [
            "Sinh",
            [
                "AS"
            ],
            "සිංහල"
        ],
        "simple": [
            "en-simple"
        ],
        "sjd": [
            "Cyrl",
            [
                "EU"
            ],
            "кӣллт са̄мь кӣлл"
        ],
        "sje": [
            "Latn",
            [
                "EU"
            ],
            "bidumsámegiella"
        ],
        "sjo": [
            "Mong",
            [
                "AS"
            ],
            "ᠰᡞᠪᡝ ᡤᡞᠰᡠᠨ"
        ],
        "sju": [
            "Latn",
            [
                "EU"
            ],
            "ubmejesámiengiälla"
        ],
        "sk": [
            "Latn",
            [
                "EU"
            ],
            "slovenčina"
        ],
        "skr": [
            "skr-arab"
        ],
        "skr-arab": [
            "Arab",
            [
                "AS"
            ],
            "سرائیکی"
        ],
        "sl": [
            "Latn",
            [
                "EU"
            ],
            "slovenščina"
        ],
        "sli": [
            "Latn",
            [
                "EU"
            ],
            "Schläsch"
        ],
        "slr": [
            "Latn",
            [
                "AS"
            ],
            "Salırça"
        ],
        "sly": [
            "Latn",
            [
                "AS"
            ],
            "Bahasa Selayar"
        ],
        "sm": [
            "Latn",
            [
                "PA"
            ],
            "Gagana Samoa"
        ],
        "sma": [
            "Latn",
            [
                "EU"
            ],
            "åarjelsaemien"
        ],
        "smj": [
            "Latn",
            [
                "EU"
            ],
            "julevsámegiella"
        ],
        "smn": [
            "Latn",
            [
                "EU"
            ],
            "anarâškielâ"
        ],
        "sms": [
            "Latn",
            [
                "EU"
            ],
            "nuõrttsääʹmǩiõll"
        ],
        "sn": [
            "Latn",
            [
                "AF"
            ],
            "chiShona"
        ],
        "so": [
            "Latn",
            [
                "AF"
            ],
            "Soomaaliga"
        ],
        "son": [
            "Latn",
            [
                "AF"
            ],
            "soŋay"
        ],
        "sq": [
            "Latn",
            [
                "EU"
            ],
            "shqip"
        ],
        "sr": [
            "sr-cyrl"
        ],
        "sr-cyrl": [
            "Cyrl",
            [
                "EU"
            ],
            "српски"
        ],
        "sr-ec": [
            "sr-cyrl"
        ],
        "sr-el": [
            "sr-latn"
        ],
        "sr-latn": [
            "Latn",
            [
                "EU"
            ],
            "srpski"
        ],
        "srn": [
            "Latn",
            [
                "AM",
                "EU"
            ],
            "Sranantongo"
        ],
        "sro": [
            "Latn",
            [
                "EU"
            ],
            "sardu campidanesu"
        ],
        "srq": [
            "Latn",
            [
                "AM"
            ],
            "mbia cheë"
        ],
        "ss": [
            "Latn",
            [
                "AF"
            ],
            "SiSwati"
        ],
        "ssy": [
            "Latn",
            [
                "AF"
            ],
            "Saaho"
        ],
        "st": [
            "Latn",
            [
                "AF"
            ],
            "Sesotho"
        ],
        "stq": [
            "Latn",
            [
                "EU"
            ],
            "Seeltersk"
        ],
        "sty": [
            "Cyrl",
            [
                "EU",
                "AS"
            ],
            "себертатар"
        ],
        "su": [
            "Latn",
            [
                "AS"
            ],
            "Sunda"
        ],
        "sv": [
            "Latn",
            [
                "EU"
            ],
            "svenska"
        ],
        "sw": [
            "Latn",
            [
                "AF"
            ],
            "Kiswahili"
        ],
        "swb": [
            "Latn",
            [
                "AF"
            ],
            "Shikomoro"
        ],
        "swh": [
            "sw"
        ],
        "sxr": [
            "Latn",
            [
                "AS"
            ],
            "Hla'alua"
        ],
        "sxu": [
            "Latn",
            [
                "EU"
            ],
            "Säggssch"
        ],
        "syc": [
            "Syrc",
            [
                "ME"
            ],
            "ܣܘܪܝܝܐ"
        ],
        "syl": [
            "Sylo",
            [
                "AS"
            ],
            "ꠍꠤꠟꠐꠤ"
        ],
        "syl-beng": [
            "Beng",
            [
                "AS"
            ],
            "সিলেটি"
        ],
        "syl-sylo": [
            "syl"
        ],
        "szl": [
            "Latn",
            [
                "EU"
            ],
            "ślůnski"
        ],
        "szy": [
            "Latn",
            [
                "AS"
            ],
            "Sakizaya"
        ],
        "ta": [
            "Taml",
            [
                "AS"
            ],
            "தமிழ்"
        ],
        "tao": [
            "Latn",
            [
                "AS"
            ],
            "Ciriciring No Tao"
        ],
        "taq": [
            "taq-tfng"
        ],
        "taq-latn": [
            "Latn",
            [
                "AF"
            ],
            "təmajəq"
        ],
        "taq-tfng": [
            "Tfng",
            [
                "AF"
            ],
            "ⵜⴰⵎⴰⵌⴰⵆ"
        ],
        "tay": [
            "Latn",
            [
                "AS"
            ],
            "Tayal"
        ],
        "tcy": [
            "Knda",
            [
                "AS"
            ],
            "ತುಳು"
        ],
        "tdd": [
            "Tale",
            [
                "AS"
            ],
            "ᥖᥭᥰ ᥖᥬᥲ ᥑᥨᥒᥰ"
        ],
        "te": [
            "Telu",
            [
                "AS"
            ],
            "తెలుగు"
        ],
        "tet": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "tetun"
        ],
        "tg": [
            "Cyrl",
            [
                "AS"
            ],
            "тоҷикӣ"
        ],
        "tg-cyrl": [
            "tg"
        ],
        "tg-latn": [
            "Latn",
            [
                "AS"
            ],
            "tojikī"
        ],
        "th": [
            "Thai",
            [
                "AS"
            ],
            "ไทย"
        ],
        "thq": [
            "Deva",
            [
                "AS"
            ],
            "काेचिला थारु"
        ],
        "thr": [
            "Deva",
            [
                "AS"
            ],
            "राना थारू"
        ],
        "ti": [
            "Ethi",
            [
                "AF"
            ],
            "ትግርኛ"
        ],
        "tig": [
            "Ethi",
            [
                "AF"
            ],
            "ትግሬ"
        ],
        "tiv": [
            "Latn",
            [
                "AF"
            ],
            "tiv"
        ],
        "tji": [
            "Latn",
            [
                "AS"
            ],
            "bifzivsar"
        ],
        "tk": [
            "Latn",
            [
                "AS"
            ],
            "Türkmençe"
        ],
        "tkr": [
            "Cyrl",
            [
                "AS"
            ],
            "цӀаӀхна миз"
        ],
        "tl": [
            "Latn",
            [
                "AS"
            ],
            "Tagalog"
        ],
        "tly": [
            "Latn",
            [
                "EU",
                "AS",
                "ME"
            ],
            "tolışi"
        ],
        "tly-cyrl": [
            "Cyrl",
            [
                "EU",
                "AS",
                "ME"
            ],
            "толыши"
        ],
        "tmr": [
            "Hebr",
            [
                "ME",
                "EU",
                "AM"
            ],
            "ארמית בבלית"
        ],
        "tn": [
            "Latn",
            [
                "AF"
            ],
            "Setswana"
        ],
        "to": [
            "Latn",
            [
                "PA"
            ],
            "lea faka-Tonga"
        ],
        "toi": [
            "Latn",
            [
                "AF"
            ],
            "chitonga"
        ],
        "tok": [
            "Latn",
            [
                "WW"
            ],
            "toki pona"
        ],
        "tokipona": [
            "tok"
        ],
        "tpi": [
            "Latn",
            [
                "PA",
                "AS"
            ],
            "Tok Pisin"
        ],
        "tr": [
            "Latn",
            [
                "EU",
                "ME"
            ],
            "Türkçe"
        ],
        "trp": [
            "Latn",
            [
                "AS"
            ],
            "Kokborok"
        ],
        "tru": [
            "Latn",
            [
                "AS"
            ],
            "Ṫuroyo"
        ],
        "trv": [
            "Latn",
            [
                "AS"
            ],
            "Seediq"
        ],
        "trw": [
            "Arab",
            [
                "AS"
            ],
            "توروالی"
        ],
        "ts": [
            "Latn",
            [
                "AF"
            ],
            "Xitsonga"
        ],
        "tsd": [
            "Grek",
            [
                "EU"
            ],
            "Τσακωνικά"
        ],
        "tsg": [
            "Latn",
            [
                "AS"
            ],
            "Sinūg"
        ],
        "tsu": [
            "Latn",
            [
                "AS"
            ],
            "cou"
        ],
        "tsw": [
            "Latn",
            [
                "AF"
            ],
            "Tsishingini"
        ],
        "tt": [
            "Cyrl",
            [
                "EU"
            ],
            "татарча"
        ],
        "tt-cyrl": [
            "tt"
        ],
        "tt-latn": [
            "Latn",
            [
                "EU"
            ],
            "tatarça"
        ],
        "ttj": [
            "Latn",
            [
                "AF"
            ],
            "Orutooro"
        ],
        "ttt": [
            "Cyrl",
            [
                "AS"
            ],
            "Tati"
        ],
        "tum": [
            "Latn",
            [
                "AF"
            ],
            "chiTumbuka"
        ],
        "tw": [
            "Latn",
            [
                "AF"
            ],
            "Twi"
        ],
        "twd": [
            "Latn",
            [
                "EU"
            ],
            "Tweants"
        ],
        "ty": [
            "Latn",
            [
                "PA"
            ],
            "reo tahiti"
        ],
        "tyv": [
            "Cyrl",
            [
                "AS"
            ],
            "тыва дыл"
        ],
        "tzl": [
            "Latn",
            [
                "WW"
            ],
            "Talossan"
        ],
        "tzm": [
            "Tfng",
            [
                "AF"
            ],
            "ⵜⴰⵎⴰⵣⵉⵖⵜ"
        ],
        "udm": [
            "Cyrl",
            [
                "EU"
            ],
            "удмурт"
        ],
        "ug": [
            "ug-arab"
        ],
        "ug-arab": [
            "Arab",
            [
                "AS"
            ],
            "ئۇيغۇرچە"
        ],
        "ug-cyrl": [
            "Cyrl",
            [
                "AS"
            ],
            "уйғурчә"
        ],
        "ug-latn": [
            "Latn",
            [
                "AS"
            ],
            "uyghurche"
        ],
        "uk": [
            "Cyrl",
            [
                "EU"
            ],
            "українська"
        ],
        "umb": [
            "Latn",
            [
                "AF"
            ],
            "umbundu"
        ],
        "umu": [
            "Latn",
            [
                "AM"
            ],
            "Huluníixsuwaakan"
        ],
        "ur": [
            "Arab",
            [
                "AS",
                "ME"
            ],
            "اردو"
        ],
        "uz": [
            "Latn",
            [
                "AS"
            ],
            "oʻzbekcha"
        ],
        "uz-arab": [
            "uzs"
        ],
        "uz-cyrl": [
            "Cyrl",
            [
                "AS"
            ],
            "ўзбекча"
        ],
        "uz-latn": [
            "uz"
        ],
        "uzn": [
            "uz"
        ],
        "uzs": [
            "Arab",
            [
                "AS"
            ],
            "اۉزبېکچه"
        ],
        "vai": [
            "Vaii",
            [
                "AF"
            ],
            "ꕙꔤ"
        ],
        "ve": [
            "Latn",
            [
                "AF"
            ],
            "Tshivenda"
        ],
        "vec": [
            "Latn",
            [
                "EU",
                "AM"
            ],
            "vèneto"
        ],
        "vep": [
            "Latn",
            [
                "EU"
            ],
            "vepsän kel’"
        ],
        "vi": [
            "Latn",
            [
                "AS"
            ],
            "Tiếng Việt"
        ],
        "vls": [
            "Latn",
            [
                "EU"
            ],
            "West-Vlams"
        ],
        "vmf": [
            "Latn",
            [
                "EU"
            ],
            "Mainfränkisch"
        ],
        "vmw": [
            "Latn",
            [
                "AF"
            ],
            "emakhuwa"
        ],
        "vo": [
            "Latn",
            [
                "WW"
            ],
            "Volapük"
        ],
        "vot": [
            "Latn",
            [
                "EU"
            ],
            "Vaďďa"
        ],
        "vro": [
            "Latn",
            [
                "EU"
            ],
            "võro"
        ],
        "wa": [
            "Latn",
            [
                "EU"
            ],
            "walon"
        ],
        "wal": [
            "Latn",
            [
                "AF"
            ],
            "wolaytta"
        ],
        "war": [
            "Latn",
            [
                "AS"
            ],
            "Winaray"
        ],
        "wls": [
            "Latn",
            [
                "PA"
            ],
            "Faka'uvea"
        ],
        "wlx": [
            "Latn",
            [
                "AF"
            ],
            "waale"
        ],
        "wo": [
            "Latn",
            [
                "AF"
            ],
            "Wolof"
        ],
        "wsg": [
            "Telu",
            [
                "AS"
            ],
            "గోండి"
        ],
        "wuu": [
            "Hani",
            [
                "AS"
            ],
            "吴语"
        ],
        "wuu-hans": [
            "Hans",
            [
                "AS"
            ],
            "吴语（简体）"
        ],
        "wuu-hant": [
            "Hant",
            [
                "AS"
            ],
            "吳語（正體）"
        ],
        "xal": [
            "Cyrl",
            [
                "EU"
            ],
            "хальмг"
        ],
        "xh": [
            "Latn",
            [
                "AF"
            ],
            "isiXhosa"
        ],
        "xmf": [
            "Geor",
            [
                "EU"
            ],
            "მარგალური"
        ],
        "xmm": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Manado"
        ],
        "xnb": [
            "Latn",
            [
                "AS"
            ],
            "Kanakanavu"
        ],
        "xon": [
            "Latn",
            [
                "AF"
            ],
            "likpakpaanl"
        ],
        "xsy": [
            "Latn",
            [
                "AS"
            ],
            "SaiSiyat"
        ],
        "ydd": [
            "yi"
        ],
        "yi": [
            "Hebr",
            [
                "ME",
                "EU",
                "AM"
            ],
            "ייִדיש"
        ],
        "yo": [
            "Latn",
            [
                "AF"
            ],
            "Yorùbá"
        ],
        "yoi": [
            "Jpan",
            [
                "AS"
            ],
            "与那国物言"
        ],
        "yrk": [
            "Cyrl",
            [
                "AS"
            ],
            "ненэцяʼ вада"
        ],
        "yrl": [
            "Latn",
            [
                "AM"
            ],
            "Nhẽẽgatú"
        ],
        "yua": [
            "Latn",
            [
                "AM"
            ],
            "Maaya T'aan"
        ],
        "yue": [
            "Hant",
            [
                "AS"
            ],
            "粵語"
        ],
        "yue-hans": [
            "Hans",
            [
                "AS"
            ],
            "粵语（简体）"
        ],
        "yue-hant": [
            "Hant",
            [
                "AS"
            ],
            "粵語（繁體）"
        ],
        "za": [
            "Latn",
            [
                "AS"
            ],
            "Vahcuengh"
        ],
        "zea": [
            "Latn",
            [
                "EU"
            ],
            "Zeêuws"
        ],
        "zgh": [
            "Tfng",
            [
                "AF"
            ],
            "ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵡⴰⵢⵜ"
        ],
        "zgh-latn": [
            "Latn",
            [
                "AF"
            ],
            "tamaziɣt tanawayt"
        ],
        "zh": [
            "Hani",
            [
                "AS",
                "PA",
                "AM",
                "WW"
            ],
            "中文"
        ],
        "zh-cdo": [
            "cdo"
        ],
        "zh-classical": [
            "lzh"
        ],
        "zh-cn": [
            "Hans",
            [
                "AS"
            ],
            "中文（中国大陆）"
        ],
        "zh-hans": [
            "Hans",
            [
                "AS",
                "PA",
                "AM",
                "WW"
            ],
            "中文（简体）"
        ],
        "zh-hant": [
            "Hant",
            [
                "AS",
                "PA",
                "AM",
                "WW"
            ],
            "中文（繁體）"
        ],
        "zh-hk": [
            "Hant",
            [
                "AS"
            ],
            "中文（香港）"
        ],
        "zh-min-nan": [
            "nan"
        ],
        "zh-mo": [
            "Hant",
            [
                "AS"
            ],
            "中文（澳門）"
        ],
        "zh-my": [
            "Hans",
            [
                "AS"
            ],
            "中文（马来西亚）"
        ],
        "zh-sg": [
            "Hans",
            [
                "AS"
            ],
            "中文（新加坡）"
        ],
        "zh-tw": [
            "Hant",
            [
                "AS"
            ],
            "中文（臺灣）"
        ],
        "zh-yue": [
            "yue"
        ],
        "zmi": [
            "Latn",
            [
                "AS",
                "PA"
            ],
            "Nismilan"
        ],
        "zsm": [
            "ms"
        ],
        "zu": [
            "Latn",
            [
                "AF"
            ],
            "isiZulu"
        ],
        "zun": [
            "Latn",
            [
                "AM"
            ],
            "Shiwi'ma"
        ]
    },
    "scriptgroups": {
        "Latin": [
            "Latn",
            "Goth"
        ],
        "Greek": [
            "Grek"
        ],
        "WestCaucasian": [
            "Armn",
            "Geor"
        ],
        "Arabic": [
            "Arab"
        ],
        "MiddleEastern": [
            "Hebr",
            "Syrc"
        ],
        "African": [
            "Bamu",
            "Copt",
            "Ethi",
            "Nkoo",
            "Tfng",
            "Vaii"
        ],
        "SouthAsian": [
            "Beng",
            "Cakm",
            "Deva",
            "Gujr",
            "Guru",
            "Knda",
            "Mlym",
            "Mtei",
            "Olck",
            "Orya",
            "Rohg",
            "Saur",
            "Sind",
            "Sinh",
            "Sylo",
            "Taml",
            "Telu",
            "Tibt",
            "Thaa",
            "Wara"
        ],
        "Cyrillic": [
            "Cyrl"
        ],
        "CJK": [
            "Hani",
            "Hans",
            "Hant",
            "Kore",
            "Jpan",
            "Yiii"
        ],
        "SouthEastAsian": [
            "Bali",
            "Batk",
            "Bugi",
            "Cham",
            "Java",
            "Khmr",
            "Laoo",
            "Lana",
            "Mymr",
            "Thai",
            "Tale"
        ],
        "Mongolian": [
            "Mong"
        ],
        "SignWriting": [
            "Sgnw"
        ],
        "NativeAmerican": [
            "Cher",
            "Cans"
        ],
        "Special": [
            "Zyyy"
        ]
    },
    "rtlscripts": [
        "Arab",
        "Hebr",
        "Syrc",
        "Nkoo",
        "Rohg",
        "Thaa"
    ],
    "regiongroups": {
        "WW": 1,
        "SP": 1,
        "AM": 2,
        "EU": 3,
        "ME": 3,
        "AF": 3,
        "AS": 4,
        "PA": 4
    },
    "territories": {
        "AC": [
            "en"
        ],
        "AD": [
            "ca",
            "es",
            "fr"
        ],
        "AE": [
            "ar",
            "en",
            "ml",
            "ps",
            "fa"
        ],
        "AF": [
            "fa",
            "ps",
            "uzs",
            "uz",
            "tk",
            "bgn",
            "kaa",
            "ug-arab",
            "kk-arab",
            "kk-cyrl"
        ],
        "AG": [
            "en",
            "pt"
        ],
        "AI": [
            "en"
        ],
        "AL": [
            "sq",
            "el",
            "mk"
        ],
        "AM": [
            "hy",
            "ru",
            "ku-latn",
            "az"
        ],
        "AO": [
            "pt",
            "umb",
            "kmb",
            "ln"
        ],
        "AR": [
            "es",
            "en",
            "cy",
            "gn"
        ],
        "AS": [
            "sm",
            "en"
        ],
        "AT": [
            "de",
            "bar",
            "en",
            "fr",
            "it",
            "hr",
            "sl",
            "hu"
        ],
        "AU": [
            "en",
            "zh-hant",
            "zh",
            "it"
        ],
        "AW": [
            "nl",
            "pap",
            "en"
        ],
        "AX": [
            "sv"
        ],
        "AZ": [
            "az",
            "az-cyrl",
            "tly",
            "ku-latn",
            "ttt",
            "tkr"
        ],
        "BA": [
            "bs",
            "en",
            "hr",
            "sr-cyrl",
            "sr-latn"
        ],
        "BB": [
            "en"
        ],
        "BD": [
            "bn",
            "en",
            "syl",
            "rhg",
            "ccp",
            "my",
            "mni"
        ],
        "BE": [
            "en",
            "nl",
            "fr",
            "de",
            "vls",
            "wa"
        ],
        "BF": [
            "mos",
            "dyu",
            "fr",
            "ff"
        ],
        "BG": [
            "bg",
            "en",
            "ru",
            "tr",
            "de"
        ],
        "BH": [
            "ar",
            "ml"
        ],
        "BI": [
            "rn",
            "fr",
            "sw",
            "en"
        ],
        "BJ": [
            "fr",
            "fon",
            "yo"
        ],
        "BL": [
            "fr"
        ],
        "BM": [
            "en"
        ],
        "BN": [
            "ms",
            "zh-hant",
            "zh",
            "ms-arab",
            "en"
        ],
        "BO": [
            "es",
            "qu",
            "ay",
            "gn",
            "aro"
        ],
        "BQ": [
            "pap",
            "nl"
        ],
        "BR": [
            "pt",
            "en",
            "de",
            "hrx",
            "it",
            "vec",
            "ja",
            "es",
            "kgp",
            "ko",
            "yrl"
        ],
        "BS": [
            "en"
        ],
        "BT": [
            "dz",
            "ne",
            "en"
        ],
        "BV": [
            "no"
        ],
        "BW": [
            "en",
            "tn",
            "af"
        ],
        "BY": [
            "ru",
            "be"
        ],
        "BZ": [
            "en",
            "es",
            "bzj"
        ],
        "CA": [
            "en",
            "fr",
            "es",
            "zh",
            "pa",
            "ar",
            "hi",
            "tl",
            "yue",
            "it",
            "de",
            "ur",
            "pt",
            "ru",
            "ta",
            "vi",
            "fa",
            "gu",
            "pl",
            "ko",
            "el",
            "uk",
            "bn",
            "ro",
            "nl",
            "ja",
            "sr-cyrl",
            "tr",
            "hr",
            "hu",
            "so",
            "ike-cans",
            "pdt",
            "moe",
            "mic",
            "atj",
            "cr",
            "war",
            "crg",
            "oka"
        ],
        "CC": [
            "ms-arab",
            "ms",
            "en"
        ],
        "CD": [
            "fr",
            "sw",
            "lua",
            "ln",
            "kg",
            "rw"
        ],
        "CF": [
            "sg",
            "fr",
            "ln"
        ],
        "CG": [
            "fr",
            "ln"
        ],
        "CH": [
            "de",
            "gsw",
            "en",
            "fr",
            "it",
            "lmo",
            "pt",
            "rm"
        ],
        "CI": [
            "fr",
            "bci"
        ],
        "CK": [
            "en"
        ],
        "CL": [
            "es",
            "en",
            "arn"
        ],
        "CM": [
            "fr",
            "en",
            "bum",
            "ff",
            "nnh",
            "bkm",
            "bas",
            "bax",
            "byv",
            "dua",
            "ar",
            "ksf",
            "ken",
            "agq",
            "ha-arab",
            "ha"
        ],
        "CN": [
            "zh",
            "wuu",
            "yue",
            "yue-hans",
            "hsn",
            "hak",
            "nan",
            "gan",
            "ii",
            "ug-arab",
            "za",
            "mvf",
            "mn",
            "bo",
            "ko",
            "kk-arab",
            "kk-cyrl",
            "ky",
            "tdd",
            "mww-latn",
            "en",
            "ru",
            "vi",
            "uz-cyrl",
            "uz",
            "lzh"
        ],
        "CO": [
            "es",
            "guc",
            "yrl"
        ],
        "CQ": [
            "en"
        ],
        "CR": [
            "es"
        ],
        "CU": [
            "es"
        ],
        "CV": [
            "kea",
            "pt"
        ],
        "CW": [
            "pap",
            "nl",
            "es"
        ],
        "CX": [
            "en"
        ],
        "CY": [
            "el",
            "en",
            "tr",
            "fr",
            "hy",
            "ar"
        ],
        "CZ": [
            "cs",
            "en",
            "sk",
            "de",
            "pl"
        ],
        "DE": [
            "de",
            "en",
            "fr",
            "bar",
            "nds",
            "nl",
            "it",
            "es",
            "ru",
            "vmf",
            "tr",
            "gsw",
            "da",
            "hr",
            "ku-latn",
            "el",
            "ksh",
            "pl",
            "hsb",
            "frr",
            "dsb",
            "frs",
            "stq",
            "pfl"
        ],
        "DG": [
            "en"
        ],
        "DJ": [
            "fr",
            "aa",
            "so",
            "ar"
        ],
        "DK": [
            "da",
            "en",
            "de",
            "sv",
            "fo",
            "kl",
            "jut"
        ],
        "DM": [
            "en"
        ],
        "DO": [
            "es",
            "en"
        ],
        "DZ": [
            "arq",
            "ar",
            "fr",
            "mey",
            "kab",
            "en"
        ],
        "EA": [
            "es"
        ],
        "EC": [
            "es",
            "qu",
            "qug"
        ],
        "EE": [
            "et",
            "ru",
            "en",
            "fi",
            "vro",
            "ie"
        ],
        "EG": [
            "ar",
            "arz",
            "en",
            "cop",
            "el"
        ],
        "EH": [
            "ar",
            "mey"
        ],
        "ER": [
            "ti",
            "en",
            "tig",
            "ar",
            "aa",
            "ssy",
            "byn"
        ],
        "ES": [
            "es",
            "en",
            "ca",
            "gl",
            "eu",
            "ast",
            "ext",
            "an",
            "oc"
        ],
        "ET": [
            "en",
            "am",
            "om",
            "so",
            "ti",
            "wal",
            "aa",
            "gez"
        ],
        "FI": [
            "fi",
            "en",
            "sv",
            "de",
            "ru",
            "et",
            "rmf",
            "se",
            "smn",
            "sms"
        ],
        "FJ": [
            "en",
            "hi",
            "hif",
            "fj",
            "rtm"
        ],
        "FK": [
            "en"
        ],
        "FM": [
            "en"
        ],
        "FO": [
            "fo"
        ],
        "FR": [
            "fr",
            "en",
            "es",
            "de",
            "oc",
            "it",
            "pt",
            "pcd",
            "gsw",
            "br",
            "co",
            "ca",
            "nl",
            "eu",
            "frp",
            "mww-latn",
            "ia"
        ],
        "GA": [
            "fr"
        ],
        "GB": [
            "en",
            "fr",
            "de",
            "es",
            "pl",
            "pa",
            "ur",
            "ta",
            "gu",
            "sco",
            "cy",
            "ro",
            "bn",
            "ar",
            "zh-hant",
            "zh",
            "it",
            "lt",
            "pt",
            "so",
            "tr",
            "ga",
            "gd",
            "kw",
            "pi"
        ],
        "GD": [
            "en"
        ],
        "GE": [
            "ka",
            "xmf",
            "ru",
            "hy",
            "ab",
            "os",
            "ku-latn",
            "lzz"
        ],
        "GF": [
            "fr",
            "gcr",
            "zh-hant",
            "zh"
        ],
        "GG": [
            "en"
        ],
        "GH": [
            "en",
            "ee",
            "abr",
            "gur",
            "ada",
            "gaa",
            "nzi",
            "ha",
            "ff"
        ],
        "GI": [
            "en",
            "es"
        ],
        "GL": [
            "kl",
            "da"
        ],
        "GM": [
            "en",
            "ff"
        ],
        "GN": [
            "fr",
            "ff",
            "nqo"
        ],
        "GP": [
            "fr"
        ],
        "GQ": [
            "es",
            "fan",
            "fr",
            "pt"
        ],
        "GR": [
            "el",
            "en",
            "fr",
            "de",
            "pnt",
            "mk",
            "tr",
            "bg",
            "sq",
            "tsd",
            "grc"
        ],
        "GS": [
            "en"
        ],
        "GT": [
            "es",
            "cak",
            "quc",
            "en",
            "jac"
        ],
        "GU": [
            "en",
            "ch"
        ],
        "GW": [
            "pt",
            "fr",
            "ff"
        ],
        "GY": [
            "en"
        ],
        "HK": [
            "zh-hant",
            "zh",
            "yue",
            "en"
        ],
        "HN": [
            "es",
            "en"
        ],
        "HR": [
            "hr",
            "en",
            "it",
            "vec"
        ],
        "HT": [
            "ht",
            "fr"
        ],
        "HU": [
            "hu",
            "en",
            "de",
            "fr",
            "ro",
            "hr",
            "sk",
            "sl"
        ],
        "IC": [
            "es"
        ],
        "ID": [
            "id",
            "jv",
            "su",
            "mad",
            "ms",
            "min",
            "bew",
            "ban",
            "bug",
            "bjn",
            "ace",
            "ms-arab",
            "sas",
            "bbc-latn",
            "zh-hant",
            "zh",
            "mak",
            "ljp",
            "rej",
            "gor",
            "kge",
            "sly",
            "mwv",
            "ban-bali"
        ],
        "IE": [
            "en",
            "ga",
            "fr"
        ],
        "IL": [
            "he",
            "en",
            "ar",
            "apc",
            "ru",
            "ro",
            "yi",
            "pl",
            "lad-latn",
            "hu",
            "am",
            "ti",
            "ml"
        ],
        "IM": [
            "en",
            "gv"
        ],
        "IN": [
            "hi",
            "en",
            "bn",
            "te",
            "mr",
            "ta",
            "ur",
            "gu",
            "kn",
            "ml",
            "or",
            "pa",
            "bho",
            "awa",
            "as",
            "bgc",
            "mag",
            "mai",
            "hne",
            "ne",
            "sat",
            "ks",
            "knn",
            "gbm",
            "sd",
            "doi",
            "tcy",
            "sd-deva",
            "brx",
            "mni",
            "raj",
            "hoc",
            "kha",
            "saz",
            "ccp",
            "bfq",
            "njo",
            "wsg",
            "bo",
            "bpy",
            "bft",
            "mrh",
            "sa",
            "dv",
            "dz",
            "pi"
        ],
        "IO": [
            "en"
        ],
        "IQ": [
            "ar",
            "en",
            "ckb",
            "ku-arab",
            "ku-latn",
            "azb",
            "az",
            "fa",
            "lrc"
        ],
        "IR": [
            "fa",
            "azb",
            "az",
            "mzn",
            "glk",
            "sdh",
            "tk",
            "lrc",
            "ar",
            "bqi",
            "luz",
            "lki",
            "kaa",
            "ckb",
            "ku-arab",
            "ku-latn",
            "bgn",
            "hy",
            "ps",
            "ka",
            "gbz",
            "kk-arab",
            "kk-cyrl"
        ],
        "IS": [
            "is",
            "da"
        ],
        "IT": [
            "it",
            "en",
            "fr",
            "lmo",
            "sc",
            "de",
            "vec",
            "pms",
            "nap",
            "lij",
            "scn",
            "sl",
            "sdc",
            "fur",
            "egl",
            "lld",
            "ca",
            "el",
            "hr",
            "rgn"
        ],
        "JE": [
            "en"
        ],
        "JM": [
            "en",
            "jam"
        ],
        "JO": [
            "ar",
            "apc",
            "en",
            "ady"
        ],
        "JP": [
            "ja",
            "ryu",
            "ko"
        ],
        "KE": [
            "sw",
            "en",
            "ki",
            "luo",
            "kam",
            "so",
            "pko",
            "om",
            "ar",
            "pa",
            "gu"
        ],
        "KG": [
            "ky",
            "ru",
            "kaa"
        ],
        "KH": [
            "km",
            "cja-latn"
        ],
        "KI": [
            "en"
        ],
        "KM": [
            "ar",
            "fr"
        ],
        "KN": [
            "en"
        ],
        "KP": [
            "ko"
        ],
        "KR": [
            "ko"
        ],
        "KW": [
            "ar"
        ],
        "KY": [
            "en"
        ],
        "KZ": [
            "ru",
            "kk-cyrl",
            "en",
            "de",
            "ug-cyrl",
            "ug-arab",
            "kaa"
        ],
        "LA": [
            "lo",
            "mww-latn"
        ],
        "LB": [
            "apc",
            "ar",
            "en",
            "fr",
            "hy",
            "ku-arab",
            "ku-latn"
        ],
        "LC": [
            "en"
        ],
        "LI": [
            "de",
            "gsw"
        ],
        "LK": [
            "si",
            "ta",
            "en",
            "pi"
        ],
        "LR": [
            "en",
            "vai",
            "ff"
        ],
        "LS": [
            "st",
            "en",
            "zu",
            "ss",
            "xh"
        ],
        "LT": [
            "lt",
            "ru",
            "en",
            "de",
            "sgs"
        ],
        "LU": [
            "fr",
            "lb",
            "de",
            "en",
            "pt"
        ],
        "LV": [
            "lv",
            "en",
            "ru",
            "ltg"
        ],
        "LY": [
            "ar"
        ],
        "MA": [
            "ary",
            "ar",
            "fr",
            "zgh",
            "en",
            "tzm",
            "shi-latn",
            "rif",
            "mey",
            "es"
        ],
        "MC": [
            "fr"
        ],
        "MD": [
            "ro",
            "uk",
            "bg",
            "gag",
            "ru"
        ],
        "ME": [
            "sr-latn",
            "sr-cyrl",
            "sq"
        ],
        "MF": [
            "fr"
        ],
        "MG": [
            "mg",
            "fr",
            "en"
        ],
        "MH": [
            "en",
            "mh"
        ],
        "MK": [
            "mk",
            "sq",
            "tr"
        ],
        "ML": [
            "bm",
            "fr",
            "ses",
            "ar"
        ],
        "MM": [
            "my",
            "shn",
            "kac",
            "rhg",
            "mnw",
            "mrh",
            "pi"
        ],
        "MN": [
            "mn",
            "kk-arab",
            "kk-cyrl",
            "zh",
            "ru",
            "ug-cyrl",
            "ug-arab"
        ],
        "MO": [
            "zh-hant",
            "zh",
            "yue",
            "en",
            "nan-hant",
            "nan",
            "tl",
            "pt"
        ],
        "MP": [
            "en",
            "ch"
        ],
        "MQ": [
            "fr"
        ],
        "MR": [
            "mey",
            "ar",
            "fr",
            "ff",
            "wo"
        ],
        "MS": [
            "en"
        ],
        "MT": [
            "mt",
            "en",
            "it",
            "fr"
        ],
        "MU": [
            "mfe",
            "fr",
            "en",
            "bho",
            "ur",
            "ta"
        ],
        "MV": [
            "dv",
            "en"
        ],
        "MW": [
            "en",
            "ny",
            "tum",
            "zu"
        ],
        "MX": [
            "es",
            "en",
            "yua",
            "vec",
            "sei"
        ],
        "MY": [
            "ms",
            "en",
            "zh",
            "ta",
            "iba",
            "jv",
            "zmi",
            "dtp",
            "ml",
            "bug",
            "bjn"
        ],
        "MZ": [
            "pt",
            "vmw",
            "ts",
            "ny",
            "sw",
            "zu"
        ],
        "NA": [
            "af",
            "kj",
            "ng",
            "naq",
            "hz",
            "en",
            "de",
            "tn"
        ],
        "NC": [
            "fr"
        ],
        "NE": [
            "ha",
            "fr",
            "ar",
            "ff"
        ],
        "NF": [
            "en"
        ],
        "NG": [
            "en",
            "pcm",
            "ha",
            "ig",
            "yo",
            "ff",
            "tiv",
            "efi",
            "ibb",
            "ha-arab",
            "bin",
            "kaj",
            "kcg",
            "ar",
            "ann"
        ],
        "NI": [
            "es"
        ],
        "NL": [
            "nl",
            "en",
            "de",
            "fr",
            "nds",
            "li",
            "fy",
            "id",
            "zea",
            "rif",
            "tr"
        ],
        "NO": [
            "nb",
            "no",
            "nn",
            "se"
        ],
        "NP": [
            "ne",
            "mai",
            "bho",
            "new",
            "en",
            "dty",
            "awa",
            "thr",
            "thq",
            "hi",
            "bo",
            "bn"
        ],
        "NR": [
            "en",
            "na"
        ],
        "NU": [
            "en",
            "niu"
        ],
        "NZ": [
            "en",
            "mi"
        ],
        "OM": [
            "ar",
            "fa"
        ],
        "PA": [
            "es",
            "en",
            "zh-hant",
            "zh"
        ],
        "PE": [
            "es",
            "qu",
            "ay"
        ],
        "PF": [
            "fr",
            "ty",
            "zh-hant",
            "zh"
        ],
        "PG": [
            "tpi",
            "en",
            "ho"
        ],
        "PH": [
            "en",
            "tl",
            "es",
            "ceb",
            "ilo",
            "hil",
            "war",
            "pam",
            "pag",
            "mdh",
            "tsg",
            "zh-hant",
            "zh",
            "cps",
            "krj",
            "bto"
        ],
        "PK": [
            "ur",
            "pnb",
            "pa",
            "en",
            "ps",
            "sd",
            "skr-arab",
            "hno",
            "brh",
            "fa",
            "bgn",
            "tg",
            "bft",
            "khw",
            "ks",
            "trw"
        ],
        "PL": [
            "pl",
            "en",
            "de",
            "ru",
            "szl",
            "be",
            "uk",
            "csb",
            "sli",
            "lt",
            "prg"
        ],
        "PM": [
            "fr",
            "en"
        ],
        "PN": [
            "en"
        ],
        "PR": [
            "es",
            "en"
        ],
        "PS": [
            "ar",
            "apc"
        ],
        "PT": [
            "pt",
            "en",
            "fr",
            "es",
            "gl"
        ],
        "PW": [
            "en"
        ],
        "PY": [
            "gn",
            "es",
            "de"
        ],
        "QA": [
            "ar",
            "fa",
            "ml"
        ],
        "RE": [
            "fr",
            "rcf",
            "ta"
        ],
        "RO": [
            "ro",
            "en",
            "fr",
            "es",
            "hu",
            "de",
            "tr",
            "sr-latn",
            "sr-cyrl",
            "bg",
            "el",
            "pl"
        ],
        "RS": [
            "sr-cyrl",
            "sr-latn",
            "sq",
            "hu",
            "ro",
            "hr",
            "sk",
            "uk"
        ],
        "RU": [
            "ru",
            "en",
            "tt",
            "cv",
            "ce",
            "hy",
            "ba",
            "de",
            "av",
            "uk",
            "kbd",
            "myv",
            "kum",
            "sah",
            "dar",
            "os",
            "inh",
            "az-cyrl",
            "az",
            "lez",
            "mdf",
            "kk-cyrl",
            "krc",
            "mhr",
            "tyv",
            "udm",
            "uz",
            "tg",
            "kv",
            "ady",
            "xal",
            "lbe",
            "ka",
            "alt",
            "be",
            "pnt",
            "koi",
            "mrj",
            "fi",
            "krl",
            "sr-cyrl",
            "mn",
            "vep",
            "cu",
            "kaa",
            "izh",
            "vot"
        ],
        "RW": [
            "rw",
            "en",
            "fr"
        ],
        "SA": [
            "ar",
            "ars"
        ],
        "SB": [
            "en",
            "pis"
        ],
        "SC": [
            "fr",
            "en"
        ],
        "SD": [
            "ar",
            "en",
            "fvr",
            "ha-arab",
            "ha"
        ],
        "SE": [
            "sv",
            "en",
            "fi",
            "fit",
            "se",
            "yi",
            "smj",
            "sma",
            "ia"
        ],
        "SG": [
            "en",
            "zh",
            "ms",
            "nan",
            "ta",
            "hak",
            "tl",
            "yue",
            "id",
            "jv",
            "bn",
            "cdo",
            "th",
            "ja",
            "cpx",
            "mad",
            "ml",
            "pa"
        ],
        "SH": [
            "en"
        ],
        "SI": [
            "sl",
            "hr",
            "en",
            "de",
            "vec",
            "hu",
            "it"
        ],
        "SJ": [
            "nb",
            "ru"
        ],
        "SK": [
            "sk",
            "cs",
            "en",
            "de",
            "hu",
            "uk",
            "pl"
        ],
        "SL": [
            "kri",
            "en",
            "ff"
        ],
        "SM": [
            "it",
            "eo"
        ],
        "SN": [
            "wo",
            "fr",
            "ff",
            "mey"
        ],
        "SO": [
            "so",
            "ar",
            "sw",
            "om"
        ],
        "SR": [
            "nl",
            "srn",
            "zh-hant",
            "zh"
        ],
        "SS": [
            "ar",
            "en",
            "nus"
        ],
        "ST": [
            "pt",
            "fr"
        ],
        "SV": [
            "es",
            "ppl"
        ],
        "SX": [
            "en",
            "es",
            "nl"
        ],
        "SY": [
            "apc",
            "ar",
            "ku-latn",
            "fr",
            "hy"
        ],
        "SZ": [
            "en",
            "ss",
            "zu",
            "ts"
        ],
        "TA": [
            "en"
        ],
        "TC": [
            "en"
        ],
        "TD": [
            "ar",
            "fr"
        ],
        "TF": [
            "fr"
        ],
        "TG": [
            "fr",
            "ee"
        ],
        "TH": [
            "th",
            "en",
            "nod",
            "mfa",
            "zh-hant",
            "zh",
            "mnw",
            "shn",
            "mww-latn",
            "pi"
        ],
        "TJ": [
            "tg",
            "ru",
            "fa",
            "ar"
        ],
        "TK": [
            "en",
            "sm"
        ],
        "TL": [
            "pt",
            "tet"
        ],
        "TM": [
            "tk",
            "ru",
            "uz",
            "ku-latn",
            "kaa"
        ],
        "TN": [
            "aeb",
            "ar",
            "fr"
        ],
        "TO": [
            "to",
            "en"
        ],
        "TR": [
            "tr",
            "en",
            "ku-latn",
            "apc",
            "kbd",
            "az",
            "azb",
            "ar",
            "bg",
            "ady",
            "kiu",
            "kaa",
            "hy",
            "ka",
            "sr-latn",
            "sr-cyrl",
            "lzz",
            "sq",
            "pnt",
            "ab",
            "el",
            "tru",
            "uz",
            "ky",
            "kk-cyrl"
        ],
        "TT": [
            "en",
            "es"
        ],
        "TV": [
            "en"
        ],
        "TW": [
            "zh-hant",
            "zh",
            "nan-hant",
            "nan",
            "hak-hant",
            "hak",
            "trv"
        ],
        "TZ": [
            "sw",
            "en",
            "lag"
        ],
        "UA": [
            "uk",
            "ru",
            "pl",
            "yi",
            "rue",
            "be",
            "crh",
            "ro",
            "bg",
            "tr",
            "hu",
            "el"
        ],
        "UG": [
            "sw",
            "lg",
            "nyn",
            "en",
            "laj",
            "ach",
            "rw",
            "ttj",
            "hi"
        ],
        "UM": [
            "en"
        ],
        "US": [
            "en",
            "es",
            "zh-hant",
            "zh",
            "fr",
            "de",
            "tl",
            "it",
            "vi",
            "ko",
            "ru",
            "mww-latn",
            "nv",
            "yi",
            "pdc",
            "haw",
            "frc",
            "chr",
            "esu",
            "cho",
            "lkt",
            "ik",
            "mus",
            "oka",
            "io",
            "jbo"
        ],
        "UY": [
            "es"
        ],
        "UZ": [
            "uz",
            "uz-cyrl",
            "ru",
            "kaa",
            "tr"
        ],
        "VA": [
            "it",
            "la"
        ],
        "VC": [
            "en"
        ],
        "VE": [
            "es",
            "yrl"
        ],
        "VG": [
            "en"
        ],
        "VI": [
            "en"
        ],
        "VN": [
            "vi",
            "mww-latn",
            "zh-hant",
            "zh",
            "cjm-cham"
        ],
        "VU": [
            "bi",
            "en",
            "fr"
        ],
        "WF": [
            "fr",
            "wls"
        ],
        "WS": [
            "sm",
            "en"
        ],
        "XK": [
            "sq",
            "aln",
            "sr-cyrl",
            "sr-latn"
        ],
        "YE": [
            "ar",
            "en"
        ],
        "YT": [
            "swb",
            "fr",
            "sw"
        ],
        "ZA": [
            "en",
            "zu",
            "xh",
            "af",
            "nso",
            "tn",
            "st",
            "ts",
            "ss",
            "ve",
            "hi",
            "nr",
            "sw"
        ],
        "ZM": [
            "bem",
            "ny",
            "en",
            "toi",
            "loz",
            "tum",
            "lue"
        ],
        "ZW": [
            "sn",
            "en",
            "nd",
            "kck",
            "ny",
            "ve",
            "tn"
        ]
    },
    "version": "2026-09-24T23:28:19+00:00"
}

		}( jQuery ) );
	}, {} ]
}, {}, [ 1 ] );
