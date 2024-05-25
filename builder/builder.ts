import { exec, execSync } from 'child_process';
import * as fs from 'fs-extra';
import path from 'path';
import { optimizeJS } from './optimize';

console.clear();

// 리엑트 빌드
console.log("리엑트 빌드 중")

exec("cd.. && cd renderer && npm run build", (err, stdout, stderr) => {
    if(err) throw err;
    if(stderr) console.error(stderr);

    // 일렉트론 컴파일    
    exec("cd.. && cd electron && tsc", async (err, stdout, stderr) => {
        if(err) throw err;
        if(stderr) console.error(stderr);

        const finalFolder = path.join('..','electron','final');

        console.log("final 폴더 초기화")
        await fs.ensureDir(finalFolder);
        await fs.emptyDir(finalFolder);

        // 리엑트 빌드     -> 일렉트론 final
        // 일렉트론 public -> 파일 최적화 -> 일렉트론 final
        const reactBuildFolder      = path.join('..','renderer','build')
        const electronPublicFolder  = path.join(__dirname,'..','electron','public')

        console.log("리엑트 빌드 파일들을 final 폴더로 복사 중")
        await fs.copy(reactBuildFolder, finalFolder);

        // webpack으로 최적화
        console.log("일렉트론 public 폴더의 파일들을 webpack으로 최적화 중")

        for(let file of await fs.readdir(electronPublicFolder, { withFileTypes: true })) {

            let doOpti = (
                file.isFile() && file.name.endsWith(".js")
            )

            const filePath = path.join(electronPublicFolder, file.name);
            const destPath = path.join(finalFolder, file.name)

            // .js 파일이 아니면 그냥 finalFolder로 복사
            if(doOpti) {
                await optimizeJS(filePath, finalFolder);
                console.log(`(최적화) ${file.name}`)
            } else {
                console.log(`(최적화 안함) ${file.name}`);
                await fs.copy(filePath, destPath)
            }
        }

        console.log("일렉트론 빌드 중")
        
        exec("cd.. && cd electron && npm run electron:build-window", (err, stdout, stderr) => {
            if(err) throw err;
            if(stderr) console.error(stderr);

            console.log("끗");
        })
    })
})