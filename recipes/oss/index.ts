import { RecipeBuilder, paths } from '@midwayjs/installer'
import { join } from 'path'

export default RecipeBuilder()
  .setName('OSS Upload Solution')
  .setDescription(
    'Auto-configuration AliCloud OSS file upload solution, including front-end and back-end code'
  )
  .setOwner('midwayjs')
  .setRepoLink('https://www.yuque.com/midwayjs/faas/oss_upload')
  .addNewFilesStep({
    stepId: 'addApiFiles',
    stepName: 'Add New Files',
    explanation: 'add front-end and back-end code',
    targetDirectory: paths.source(),
    templatePath: join(__dirname, 'templates'),
    templateValues: {},
  })
  .addAddDependenciesStep({
    stepId: 'addDependencies',
    stepName: 'Add dependencies',
    explanation: 'We need to add some dependencies',
    packages: [
      {
        name: 'ali-oss',
        version: 'latest',
        isDevDep: false,
      },
      {
        name: '@types/ali-oss',
        version: 'latest',
        isDevDep: true,
      },
    ],
  })
  .build()
