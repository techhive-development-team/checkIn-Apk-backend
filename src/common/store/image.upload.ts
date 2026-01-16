import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';


export function saveBase64Image(base64: string): string {
    const matches = base64.match(/^data:(image\/\w+);base64,(.+)$/);

    const buffer = Buffer.from(
        matches ? matches[2] : base64,
        'base64',
    );

    const ext = matches
        ? matches[1].split('/')[1]
        : 'png';

    const fileName = `${randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'uploads', 'logos');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/logos/${fileName}`;
}
