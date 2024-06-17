const { exec } = require('child_process');

const flowdir = process.env.npm_config_flowdir;

if (!flowdir) {
    console.error('\x1b[31m', 'Do not know where flow code.');
    console.error('\x1b[31m', 'Provide the path with --flowDir=');
    console.error('\x1b[31m', 'example : ~/code/flow or /home/user/code/flow');
    console.log('\x1b[31m', 'FAILED');
    process.exit(9);
}

// Go into the flow directory so we can run the supabase command
process.chdir(flowdir.replace('~', process.env.HOME));

// Generate the type file from supabase
const outputPath = `${process.env.npm_config_local_prefix}/deps/supabase/types.d.ts`;
exec(
    `npx supabase gen types typescript --project-id "eyrcnmuzzyriypdajwdk" --schema public > ${outputPath}`,
    (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            console.log('\x1b[31m', 'FAILED');
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            console.log('\x1b[31m', 'FAILED');
            return;
        }
        console.log(`stdout: ${stdout}`);
    }
);

console.log('created:', outputPath);
console.log('\x1b[32m', 'SUCCESS');
process.exit(0);
