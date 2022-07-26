### 最後に
---
### CDKはなぜ生まれて、なぜあの形をしているのか
---
- [AWSブログ] <!-- .element style="font-size: 32px;" -->
  [Working backwards: The story behind the AWS Cloud Development Kit](https://aws.amazon.com/jp/blogs/opensource/working-backwards-the-story-behind-the-aws-cloud-development-kit/)<!-- .element style="font-size: 32px;" -->
- [AWSブログ] <!-- .element style="font-size: 32px; margin-top: 16px" -->
  [AWS CDKでクラウドアプリケーションを開発するためのベストプラクティス](https://aws.amazon.com/jp/blogs/news/best-practices-for-developing-cloud-applications-with-aws-cdk/)<!-- .element style="font-size: 32px;" -->
Notes:
前者には、CDKの作者 Elad Ben-Israel が如何にしてCDKを作成するに至ったかが書かれています

後者には、現在最もCDKにコミットしているRico HuijbersがCDKの哲学について説明しています。
---
- 2 pizza team。開発（アプリケーション）と運用（インフラストラクチャ）を近づける試み。DevOps。<!-- .element style="font-size: 36px;" -->
- アプリケーションをユーザーに届けるためのすべてを cloud assembly という形式で管理、デプロイする。<!-- .element style="font-size: 36px; margin-top: 16px" -->
- 少数チームでサービスを育てるためのすべてを管理して、高効率開発につなげるための、思いとプラクティスが詰まってる。それがCDKです。<!-- .element style="font-size: 36px; margin-top: 16px" -->
Notes:
CDKの実装ポリシーは以下のドキュメントにまとまっている。
https://github.com/aws/aws-cdk/blob/main/docs/DESIGN_GUIDELINES.md <!-- .element: style="overflow-wrap: break-word;" -->

第一項: [CDKの哲学](https://aws.amazon.com/jp/blogs/news/best-practices-for-developing-cloud-applications-with-aws-cdk/#more-46953:~:text=%E3%81%A6%E3%81%8F%E3%81%A0%E3%81%95%E3%81%84%E3%80%82-,CDK%E3%81%AE%E5%93%B2%E5%AD%A6,-%E5%89%8D%E5%9B%9E%E3%81%AE%E8%A8%98%E4%BA%8B)より

第二項: cloud assembly についてはここが[ここ](https://docs.aws.amazon.com/cdk/v2/guide/apps.html#apps_cloud_assembly:~:text=These%20artifacts%20include%20AWS%20CloudFormation%20templates%2C%20AWS%20Lambda%20application%20bundles%2C%20file%20and%20Docker%20image%20assets%2C%20and%20other%20deployment%20artifacts.)とその周辺を読むのが一番理解しやすいと思う。

第三項: [注意]激しく個人の感想です。  
でもLeanとDevOpsの科学に書いてあった多くのプラクティス繋がるアイディアではあるはず。

---
サービスを生み、育てるものとして、本番で動作するアプリケーションまで責任を持ち、高効率開発につなげよう！
Notes: [注意]個人のお気持ちです。
---
### ご清聴ありがとうございました！
---
最後にクイズです！
---
DevelopersIO 2022 イベントサイトの ○○○○○○ を見よう！<!-- .element style="font-size: 32px;" -->  
○○○○○○ の部分は下の画像がヒントだよ！<!-- .element style="font-size: 32px;" -->  
![](./quiz.png) <!-- .element: height="500px" -->
