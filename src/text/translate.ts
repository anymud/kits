// import googleTranslate, { languages } from '@vitalets/google-translate-api'

import path from 'path'
import { isTruthy } from '@antfu/utils'
import consola from 'consola'
import gct from '@google-cloud/translate'
import { instanceFunction } from '~/kit'
import { GoogleTranslator } from '~/kit/text/translators/googleTranslator'
import { useBatcher } from '~/kit/task/useBatcher'

function getLanguage(locale: string) {
  return locale.split('-')[0]
}

function isSameLanguage(locale1: string, locale2: string) {
  return getLanguage(locale1) === getLanguage(locale2)
}
// const { TranslationServiceClient } = gct.v3
// const projectId = '1060082096747'
// const config = useConfig()
// const keyFile = path.resolve(config.gc.storage.keyPath)
// const translationServiceClient = new TranslationServiceClient({
//   keyFilename: keyFile,
// })
// async function _translate(text: string, to: string) {
//   // console.log(text, to)
//   const [response] = await translationServiceClient.translateText({
//     parent: `projects/${projectId}/locations/global`,
//     mimeType: 'text/html',
//     contents: [text],
//     targetLanguageCode: to,
//   })
//   const translation = response.translations?.[0]
//   if (!translation)
//     throw new Error('Missing translation')
//   return translation
// }

const translator = useBatcher(instanceFunction(new GoogleTranslator(), x => x.translateBatch))
// const translator = new GoogleTranslator()

// export async function translate(text: string, to: string) {
//   let translation = await _translate(text, to)
//   if (!translation.translatedText)
//     throw new Error('translated text becomes empty')
//
//   // let result = await translator.advanceTranslate(text, to)
//   if (isTruthy(translation.detectedLanguageCode) && isSameLanguage(translation.detectedLanguageCode, to)) {
//     const translatePipeline = [to === 'en' ? 'zh-TW' : 'en', to]
//     for (const currentTo of translatePipeline) {
//       // console.log('retranslate...', currentTo)
//       translation = await _translate(translation.translatedText, currentTo)
//       // console.log('result', translation)
//       if (!translation.translatedText)
//         throw new Error('translated text becomes empty')
//     }
//   }
//   return translation.translatedText
// }

export async function translate(text: string, to: string) {
  if (!text.trim())
    return text

  let translation = await translator.run({ text, to })
  if (!translation.translatedText)
    return text
    // throw new Error(`translated text becomes empty: ${text}`)

  // let result = await translator.advanceTranslate(text, to)
  if (isTruthy(translation.detectedLanguageCode) && isSameLanguage(translation.detectedLanguageCode, to)) {
    const translatePipeline = [to === 'en' ? 'sv' : 'en', to]
    for (const currentTo of translatePipeline) {
      // console.log('retranslate...', currentTo)
      translation = await translator.run({ text: translation.translatedText, to: currentTo })
      // console.log('result', translation)
      if (!translation.translatedText)
        return text
        // throw new Error(`translated text becomes empty: ${text}`)
    }
  }
  return translation.translatedText
}
