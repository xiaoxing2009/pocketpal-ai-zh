# 下载
**本仓库不提供构建版本**，请前往以下仓库下载（内容相同）：
- [a-ghorbani/pocketpal-ai](https://github.com/a-ghorbani/pocketpal-ai/releases)
<br>

> **免责声明**：以下内容由AI翻译，并且可能不是最新的！

# PocketPal AI 📱🚀

PocketPal AI 是一款“口袋大小”的 AI 助手，由直接在您手机上运行的小型语言模型 (SLMs) 驱动。专为 iOS 和 Android 设计，PocketPal AI 让您无需互联网连接即可与各种 SLM 交互。您的隐私得到充分保护，因为所有处理都在设备上完成——您的对话、提示和数据永远不会离开您的手机，也不会存储在外部的服务器上。

> **隐私说明**：唯一可能离开您设备的数据是您明确选择分享的内容：性能测试结果（如果您选择贡献给排行榜）以及您通过应用自愿提交的任何反馈。

## 目录

- [PocketPal AI 📱🚀](#pocketpal-ai-)
  - [目录](#目录)
  - [📰 新闻与公告](#-新闻与公告)
  - [功能](#功能)
  - [安装](#安装)
    - [iOS](#ios)
    - [Android](#android)
  - [使用](#使用)
    - [下载模型](#下载模型)
    - [加载模型](#加载模型)
    - [与模型聊天](#与模型聊天)
    - [复制文本](#复制文本)
    - [消息编辑](#消息编辑)
    - [使用 AI 伙伴 (Pals)](#使用-ai-伙伴-pals)
    - [性能测试](#性能测试)
    - [设置 Hugging Face 访问令牌](#设置-hugging-face-访问令牌)
    - [发送反馈](#发送反馈)
  - [开发设置](#开发设置)
    - [先决条件](#先决条件)
    - [开始使用](#开始使用)
    - [脚本](#脚本)
  - [贡献](#贡献)
    - [贡献者快速入门](#贡献者快速入门)
  - [路线图](#路线图)
  - [许可证](#许可证)
  - [联系方式](#联系方式)
  - [致谢](#致谢)

## 📰 新闻与公告
- **🔒 HF 令牌认证 (v1.9.0, 2025年4月)**: 使用您的认证令牌访问 Hugging Face 上的受限模型。
- **🌐 本地化支持 (v1.8.16, 2025年4月)**: PocketPal AI 现在支持多语言（目前包括日语和中文）。
- **📱 iPad 支持 (v1.8.12, 2025年3月)**: 全面支持 iPad 设备，包括横屏方向。
- **👤 AI 伙伴 (Pals) 功能 (v1.8.0, 2025年2月)**: 创建具有不同个性的个性化 AI 助手并与之聊天。
- **🔍 性能测试工具 (v1.6.1, 2024年)**: 使用内置的性能测试功能测试和比较模型表现。
- **🎨 新图标提醒 (2024年11月)**: PocketPal AI 焕然一新！非常感谢 **[Chun Te Lee](https://github.com/Reeray)** 的设计！[阅读更多](https://github.com/a-ghorbani/pocketpal-ai/discussions/102)。
- **🚀 Hugging Face 公共 Hub 集成 (v1.5, 2024年11月)**: PocketPal AI 现已集成 Hugging Face 模型 Hub！在应用内直接浏览、下载和运行来自 Hugging Face Hub 的模型。[阅读更多](https://github.com/a-ghorbani/pocketpal-ai/discussions/104)

## 功能

- **离线 AI 助手**: 无需互联网连接，直接在设备上运行语言模型。
- **模型灵活性**: 下载并在多个 SLM 之间切换，包括 Danube 2 和 3、Phi、Gemma 2 和 Qwen。
- **自动卸载/加载**: 当应用在后台时，自动管理内存卸载模型。
- **推理设置**: 自定义模型参数，如系统提示词、温度 (temperature)、BOS 令牌和聊天模板。
- **实时性能指标**: 在 AI 生成响应时查看每秒令牌数和每令牌毫秒数。
- **消息编辑**: 编辑您的消息并重新尝试 AI 生成。
- **个性化 AI 伙伴 (Pals)**: 使用自定义设置创建不同的 AI 个性。
- **后台下载**: 在使用其他应用时继续下载模型 (iOS)。
- **推理期间保持屏幕唤醒**: 在 AI 生成响应时保持屏幕开启。
- **多设备支持**: 针对手机和平板电脑（包括 iPad）进行了优化。
- **本地化**: 使用您首选的语言操作应用。
- **Hugging Face 集成**: 通过认证访问公共和受限模型。

## 安装

### iOS

从 App Store 下载 PocketPal AI：

[**在 App Store 下载**](https://apps.apple.com/us/app/pocketpal-ai/id6502579498)

### Android

在 Google Play 获取 PocketPal AI：

[**在 Google Play 获取**](https://play.google.com/store/apps/details?id=com.pocketpalai)

## 使用

### 下载模型

1.  打开应用并点击 **菜单** 图标 (☰)。
2.  导航到 **模型** 页面。
3.  从列表中选择一个模型并点击 **下载**。
4.  或者点击 + 按钮添加来自 Hugging Face 的模型或本地下载的模型。
5.  如果选择“从 Hugging Face 添加”，您可以直接在 HF 上搜索 GGUF 模型，并选择适合您设备（内存和存储）的任何量化版本。
6.  然后您可以立即下载或将其加入书签稍后下载。

<img src="assets/images and logos/Download_models.png" alt="下载模型截图" width="100%">

### 加载模型

*   下载后，点击模型旁边的 **加载** 将其加载到内存中。
*   您也可以在聊天页面内，使用聊天输入框左侧的 V 形图标直接加载模型。

### 与模型聊天

1.  确保已加载模型。
2.  从菜单导航到 **聊天** 页面。
3.  开始与您的 AI 助手对话！
4.  在推理期间屏幕将保持唤醒状态，空闲时关闭。
5.  您可以使用聊天输入框左侧的 V 形图标选择和加载模型。

<img src="assets/images and logos/Chat.png" alt="聊天截图" width="83%">

### 复制文本

*   **复制整个回复**: 点击 AI 回复气泡底部的复制图标。
*   **复制特定段落**: 长按某个段落以复制其内容。

*注意*：复制时保留文本格式的功能目前有限。我们正在努力改进此功能。

### 消息编辑

1.  长按您的任何消息进行编辑。
2.  编辑后，AI 将根据您的更改重新生成其响应。
3.  使用重试选项在不更改消息的情况下获取新的响应。
4.  您也可以使用不同的模型重试生成，以进行比较或获得更好的结果。

### 使用 AI 伙伴 (Pals)

1.  创建具有不同个性和设置的个性化 AI 助手。
2.  PocketPal 提供两种不同的伙伴类型：
    *   **助手伙伴 (Assistant Pal)**: 选择一个默认模型，设置系统提示词（手动或由另一个 AI 生成），并自定义聊天文本输入颜色。
    *   **角色扮演伙伴 (Roleplay Pal)**: 与助手伙伴类似，但增加了位置、AI 角色和其他上下文参数的额外设置。
3.  使用聊天页面中的伙伴选择器 (Pal picker) 选择一个伙伴，以便在不同角色之间快速切换。

<div style="margin-top: 30px; margin-bottom: 30px;">
  <img src="assets/images and logos/Pals.png" alt="助手伙伴截图" width="100%">
  <p><em>创建一个鸡尾酒配方助手的示例</em></p>
</div>

<div style="margin-top: 30px; margin-bottom: 30px;">
  <img src="assets/images and logos/Roleplay.png" alt="角色扮演伙伴截图" width="33%">
  <p><em>设置具有自定义参数的角色扮演伙伴</em></p>
</div>

<div style="margin-top: 30px; margin-bottom: 30px;">
  <img src="assets/images and logos/Pals-AI_generates_system_prompt.png" alt="AI 生成系统提示词" width="16%">
  <p><em>使用 AI 为您的伙伴生成系统提示词</em></p>
</div>

### 性能测试

1.  导航到性能测试页面。
2.  在您的模型上运行性能测试以比较速度和效率。
3.  查看详细指标，如每秒令牌数和内存使用情况。
4.  分享您的性能测试结果，并在 [PocketPal AI 手机排行榜](https://huggingface.co/spaces/a-ghorbani/ai-phone-leaderboard) 上与其他设备进行比较。

<img src="assets/images and logos/Benchmark.png" alt="性能测试截图" width="100%">

### 设置 Hugging Face 访问令牌

设置您的认证令牌以访问 Hugging Face 上的受限模型：

1.  首先，从您的 Hugging Face 帐户获取访问令牌：
    *   参考 [HF 安全令牌文档](https://huggingface.co/docs/hub/en/security-tokens)

    <img src="assets/images and logos/Get_token_from_HF.png" alt="从 Hugging Face 获取令牌" width="100%"> (*注：原文图片宽度为1000%，此处修正为100%*)

2.  在 PocketPal AI 中：
    *   导航到设置页面
    *   点击“设置令牌”
    *   在文本输入框中粘贴您的个人访问令牌
    *   保存

    <img src="assets/images and logos/Token_in_pocketpal.png" alt="在 PocketPal 中设置令牌" width="66%">

### 发送反馈

直接从应用分享您的想法：

1.  导航到应用信息页面
2.  点击“分享您的想法”
3.  输入您想分享的任何内容，从功能请求到建议
4.  点击“提交反馈”

<img src="assets/images and logos/Send_Feedback.png" alt="发送反馈截图" width="50%">

## 开发设置

有兴趣贡献或在本地运行应用吗？请按照以下步骤操作。

### 先决条件

*   **Node.js** (版本 18 或更高)
*   **Yarn**
*   **React Native CLI**
*   **Xcode** (用于 iOS 开发)
*   **Android Studio** (用于 Android 开发)

### 开始使用

1.  **Fork 并克隆仓库**

    ```bash
    git clone https://github.com/a-ghorbani/pocketpal-ai
    cd pocketpal-ai
    ```

2.  **安装依赖**

    ```bash
    yarn install
    ```

3.  **安装 Pod 依赖 (仅 iOS)**

    ```bash
    cd ios
    pod install
    cd ..
    ```

4.  **运行应用**

    *   **iOS 模拟器**

      ```bash
      yarn ios
      ```

    *   **Android 模拟器**

      ```bash
      yarn android
      ```

### 脚本

*   **启动 Metro Bundler**

  ```bash
  yarn start
  ```

*   **清理构建产物**

  ```bash
  yarn clean
  ```

*   **代码检查 (Lint) 和类型检查 (Type Check)**

  ```bash
  yarn lint
  yarn typecheck
  ```

*   **运行测试**

  ```bash
  yarn test
  ```

## 贡献

我们欢迎所有贡献！开始之前，请阅读我们的 [贡献指南](CONTRIBUTING.md) 和 [行为准则](./CODE_OF_CONDUCT.md)。

### 贡献者快速入门

1.  **Fork 仓库**
2.  **创建新分支**

    ```bash
    git checkout -b feature/您的功能名称
    ```

3.  **进行您的更改**
4.  **测试您的更改**

    *   **在 iOS 上运行**

      ```bash
      yarn ios
      ```

    *   **在 Android 上运行**

      ```bash
      yarn android
      ```

5.  **代码检查和类型检查**

    ```bash
    yarn lint
    yarn typecheck
    ```

6.  **提交您的更改**

    *   遵循约定式提交 (Conventional Commits) 格式：

      ```bash
      git commit -m "feat: 添加对新模型的支持"
      ```

7.  **推送并创建拉取请求 (Pull Request)**

    ```bash
    git push origin feature/您的功能名称
    ```

## 路线图

*   **新模型**: 添加对更多微型 LLM 的支持。
*   **UI/UX 增强**: 持续改进整体用户界面和用户体验。
*   **改进文档**: 加强项目的文档。
*   **性能优化**: 进一步优化不同设备类型的性能。
*   **更多语言**: 通过本地化添加对更多语言的支持。
*   **增强的错误处理**: 改进错误处理和恢复机制。

欢迎随时提出问题 (issues) 来建议功能或报告错误。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 联系方式

如有疑问或反馈，请创建一个 issue。

## 致谢

PocketPal AI 的构建得益于以下出色的项目：

*   **[llama.cpp](https://github.com/ggerganov/llama.cpp)**: 实现在本地设备上高效推理 LLM。
*   **[llama.rn](https://github.com/mybigday/llama.rn)**: 将 llama.cpp 绑定集成到 React Native 中。
*   **[React Native](https://reactnative.dev/)**: 为跨平台移动体验提供支持的框架。
*   **[MobX](https://mobx.js.org/)**: 保持应用响应式和高效的状管理库。
*   **[React Native Paper](https://callstack.github.io/react-native-paper/)**: 为 UI 提供 Material Design 组件。
*   **[React Navigation](https://reactnavigation.org/)**: 为应用屏幕提供路由和导航。
*   **[Gorhom Bottom Sheet](https://github.com/gorhom/react-native-bottom-sheet)**: 为整个应用提供流畅的底部操作表交互。
*   **[@dr.pogodin/react-native-fs](https://github.com/birdofpreyru/react-native-fs)**: 提供文件系统访问，支持模型下载和管理。

以及许多其他使本项目成为可能的开源库！

---

探索愉快！🚀📱✨
