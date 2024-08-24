import HasteMap from "jest-haste-map";
import os from "os";
import path from "path";

type Config = {
  project: string;
};

export async function watchFile(file: string, onChange: () => void) {
  const dirname = path.dirname(file);
  const map = await HasteMap.create({
    id: "foobar", //Used for caching.
    extensions: ["bx"], // Tells jest-haste-map to only crawl .js files.
    maxWorkers: os.availableParallelism(), //Parallelizes across all available CPUs.
    platforms: [], // This is only used for React Native, you can leave it empty.
    rootDir: dirname, //The project root.
    roots: [dirname], // Can be used to only search a subset of files within `rootDir`
    retainAllFiles: true,
    useWatchman: true,
    watch: true,
  });

  console.log("dirname hi", dirname);

  map.on("change", (e) => {
    console.log("event", e);
    onChange();
  });

  const { hasteFS } = await map.build();
  const files = hasteFS.getAllFiles();
  console.log(files);
  console.log("now watchig.");
}

// main().catch(console.error);
async function main() {
  const root = __dirname;
  const map = await HasteMap.create({
    id: "myproject", //Used for caching.
    extensions: ["bx"], // Tells jest-haste-map to only crawl .js files.
    maxWorkers: os.availableParallelism(), //Parallelizes across all available CPUs.
    platforms: [], // This is only used for React Native, you can leave it empty.
    rootDir: root, //The project root.
    roots: [root], // Can be used to only search a subset of files within `rootDir`
    retainAllFiles: true,
    useWatchman: true,
    watch: true,
  });

  map.on("change", (e) => {
    /**
 * 
 * {
  eventsQueue: [
    {
      filePath: '/Users/kevin/Desktop/dev/achi-lang/packages/cli/foo.bx',
      stat: undefined,
      type: 'delete'
    }
  ],
  hasteFS: HasteFS {
    _rootDir: '/Users/kevin/Desktop/dev/achi-lang/packages/cli',
    _files: Map(0) {}
  },
  moduleMap: ModuleMap {
    _raw: {
      duplicates: Map(0) {},
      map: Map(0) {},
      mocks: Map(0) {},
      rootDir: '/Users/kevin/Desktop/dev/achi-lang/packages/cli'
    },
    json: undefined
  }
}
 */
  });

  const { hasteFS } = await map.build();
  const files = hasteFS.getAllFiles();
  console.log(files);
}
