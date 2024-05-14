const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));  // publicディレクトリ内の静的ファイルをホストする

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // index.htmlをルートで提供
});

app.post('/generate-pdf', async (req, res) => {
    try {
        const { text1, text2, text, newText, addressNumber, addressInfo, mobile, email, tel, fax } = req.body;
        const contactInfo = `Mobile.${mobile} Mail.${email}`;
        const newContactInfo = `TEL.${tel} FAX.${fax}`;
        const pdfBytes = await modifyPdf(text1, text2, text, newText, addressNumber, addressInfo, contactInfo, newContactInfo);
        fs.writeFileSync('public/output.pdf', pdfBytes); // PDFをpublicディレクトリに保存
        res.send({ success: true, message: "PDF generated successfully." });
    } catch (error) {
        console.error('Error during PDF generation:', error);
        res.status(500).send({ success: false, message: 'Error generating PDF' });
    }
});

async function modifyPdf(text1, text2, text, newText, addressNumber, addressInfo, contactInfo, newContactInfo) {
    try {
        // PDF生成処理
    } catch (error) {
        console.error('PDF生成エラー:', error);
        throw error;  // エラーを外部に投げて、呼び出し元で対応できるようにする
    };

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const existingPdfBytes = fs.readFileSync('documents/Dgloss_template.pdf');
    const loadedPdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const [firstPage] = await pdfDoc.copyPages(loadedPdfDoc, [0]);
    pdfDoc.addPage(firstPage);

    // ここからフォント読み込み
    // 日本語用フォント（源真ゴシック）を読み込む
    const japaneseFontBytes = fs.readFileSync('fonts/GenShinGothic-Regular.ttf');
    const japaneseFont = await pdfDoc.embedFont(japaneseFontBytes, { subset: true });

    // 日本語用フォント（源真ゴシック-Medium）を読み込む
    const mediumJapaneseFontBytes = fs.readFileSync('fonts/GenShinGothic-Medium.ttf');
    const mediumJapaneseFont = await pdfDoc.embedFont(mediumJapaneseFontBytes, { subset: true });

    // 英数字用フォント（HelveticaNeue）を読み込む
    const newFontBytes = fs.readFileSync('fonts/HelveticaNeue.ttf');
    const newFont = await pdfDoc.embedFont(newFontBytes, { subset: true });

    // 英数字用フォント（HelveticaNeue-Medium）を読み込む
    const anotherFontBytes = fs.readFileSync('fonts/HelveticaNeue-Medium.ttf');
    const anotherFont = await pdfDoc.embedFont(anotherFontBytes, { subset: true });

    // 日本語英数字複合フォント（HelveticaNeue-Gen）を読み込む
    const compositeFontBytes = fs.readFileSync('fonts/HelveticaNeue-Gen-2.ttf');
    const compositeFont = await pdfDoc.embedFont(compositeFontBytes, { subset: true });

    // 日本語英数字複合フォント（HelveticaNeue-Gen-Medium）を読み込む
    const mediumCompositeFontBytes = fs.readFileSync('fonts/HelveticaNeue-Gen-Medium.ttf');
    const mediumCompositeFont = await pdfDoc.embedFont(mediumCompositeFontBytes, { subset: true });

    // ここからテキスト書き込み
    // タイトルテキスト
    const additionalText = [text1, text2];
    const additionalOffsetY = 370; 
    additionalText.forEach((text, index) => {
        let offsetX = 50;
        const offsetY = additionalOffsetY - (index * 9.5);
        const spacing = 1.5;
        for (let i = 0; i < text.length; i++) {
            firstPage.drawText(text[i], {
                x: offsetX,
                y: offsetY,
                size: 7.3,
                font: japaneseFont,
                color: rgb(0, 0, 0)
            });
            const charWidth = japaneseFont.widthOfTextAtSize(text[i], 7.3);
            offsetX += charWidth + spacing;
        }
    });

    // 氏名テキスト
    let offsetX = 50; //左端からの距離
    const offsetY = 342.5; //下端からの距離（数値が上がるほど上に上がる）
    const spacing = 2; //文字間スペース
    for (let i = 0; i < text.length; i++) {
        firstPage.drawText(text[i], {
            x: offsetX,
            y: offsetY,
            size: 12,
            font: japaneseFont,
            color: rgb(0, 0, 0)
        });
        const textWidth = japaneseFont.widthOfTextAtSize(text[i], 12);
        offsetX += textWidth + spacing;
    }

    // 英語テキスト（氏名テキストの後ろ一定間隔離して設置）
    const newSpacing = 0.15; // 文字間スペース
    offsetX += 6.5; // 前のテキストの最後の文字から6.5px離れた位置を初期位置とする
    for (let i = 0; i < newText.length; i++) {
        firstPage.drawText(newText[i], {
            x: offsetX,
            y: offsetY,
            size: 5.5,
            font: anotherFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = anotherFont.widthOfTextAtSize(newText[i], 5.5);
        offsetX += charWidth + newSpacing; // 次の文字の位置を更新
    }

    // 社名を挿入
    const companyName = "株式会社ディグロス";
    offsetX = 50;
    const companyOffsetY = 310;
    const companySpacing = 1.6;
    for (let i = 0; i < companyName.length; i++) {
        firstPage.drawText(companyName[i], {
            x: offsetX,
            y: companyOffsetY,
            size: 6.5,
            font: mediumJapaneseFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = mediumJapaneseFont.widthOfTextAtSize(companyName[i], 5.5);
        offsetX += charWidth + companySpacing;
    }

    // 住所（1行目）挿入
    offsetX = 50;
    const addressNumberOffsetY = 301;
    const addressNumberSpacing = 1;
    for (let i = 0; i < addressNumber.length; i++) {
        firstPage.drawText(addressNumber[i], {
            x: offsetX,
            y: addressNumberOffsetY,
            size: 6.0,
            font: compositeFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = compositeFont.widthOfTextAtSize(addressNumber[i], 5.5);
        offsetX += charWidth + addressNumberSpacing;
    }

    // 住所（2行目）挿入
    offsetX = 50;
    const addressInfoOffsetY = 294;
    const addressInfoSpacing = 1;
    for (let i = 0; i < addressInfo.length; i++) {
        firstPage.drawText(addressInfo[i], {
            x: offsetX,
            y: addressInfoOffsetY,
            size: 6.0,
            font: compositeFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = compositeFont.widthOfTextAtSize(addressInfo[i], 5.5);
        offsetX += charWidth + addressInfoSpacing;
    }

    // 連絡先情報のテキストを一文字ずつ描画
    offsetX = 50; // X軸の初期位置リセット
    const contactOffsetY = 286;
    const contactSpacing = 0.4; // 文字間スペースを調整
    for (let i = 0; i < contactInfo.length; i++) {
        firstPage.drawText(contactInfo[i], {
            x: offsetX,
            y: contactOffsetY,
            size: 6.5,
            font: newFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = newFont.widthOfTextAtSize(contactInfo[i], 6);
        offsetX += charWidth + contactSpacing;
    }

    // 新しい連絡先情報 "TEL.03-6869-8063 FAX.03-6869-8064" を挿入
    offsetX = 50; // X軸の初期位置を再設定
    const newContactOffsetY = 278; // 新しいY軸の位置
    for (let i = 0; i < newContactInfo.length; i++) {
        firstPage.drawText(newContactInfo[i], {
            x: offsetX,
            y: newContactOffsetY,
            size: 6.5,
            font: newFont,
            color: rgb(0, 0, 0)
        });
        const charWidth = newFont.widthOfTextAtSize(newContactInfo[i], 6);
        offsetX += charWidth + contactSpacing; // 文字間隔を保持
    }

    // PDFを保存してバイト配列として返す
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('public/output.pdf', pdfBytes); // ローカルにPDFファイルを保存
    return pdfBytes;
}

// ローカルテストの場合　app.listen(3000, () => console.log('Server running on port 3000'));

//Herokuが割り当てるポート番号
const PORT = process.env.PORT || 3000; // Herokuが提供するPORT変数、またはローカルで3000番ポートを使用

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
