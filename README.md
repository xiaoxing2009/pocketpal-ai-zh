# 下载
本仓库不提供构建版本，请前往以下仓库下载(内容是一样的)
- [a-ghorbani/pocketpal-ai](https://github.com/a-ghorbani/pocketpal-ai/releases)

- [目录](#table)

# PocketPal AI 📱🚀

- [iOS](#ios)

PocketPal AI 是一款袖珍型 AI 助手，由直接在手机上运行的小型语言模型 (SLM) 提供支持。PocketPal AI 专为 iOS 和 Android 设计，让您无需互联网连接即可与各种 SLM 进行交互。您的隐私受到完全保护，因为所有处理都完全在设备上进行 — 您的对话、提示和数据永远不会离开您的手机或存储在外部服务器上。

- [加载模型](#loading-a-model)
> **隐私注意事项**：唯一可能离开您的设备的数据是您明确选择分享的数据：基准测试结果(如果您选择为排行榜做出贡献)以及您通过应用程序自愿提交的任何反馈。
- [使用伙伴](#using-pals)
## 目录
- [开发设置](#development-setup)
- [PocketPal AI 📱🚀 ](#pocketpal-ai-)
- [贡献](#contributing)
- [ 📰 新闻与公告](#-新闻--公告)
- [功能](#features)
- [安装](#installation)
- [联系方式](#contact)
- [Android](#android)
- [用法](#usage)
- [下载模型](#downloading-a-model)
- ** 🌐 本地化支持(v1.8.16,2025 年 4 月)**：PocketPal AI 现在支持多种语言(目前为日语和中文)。
- [与模特聊天](#chatting 与模特聊天)
- [复制文本](#copying-文本)
- [消息编辑](#message 编辑)
5. 如果您选择“从 Hugging Face 添加”，您可以直接在 HF 上搜索 GGUF 模型并选择适合您设备的任何量化(内存和存储)。
- [基准测试](#benchmarking)
- [设置 Hugging Face Access Token](#setup-hugging-face-access-token)
- [发送反馈](#send 反馈)
6. 然后，您可以立即下载或将其添加为书签以备后用。
- [先决条件](#prerequisites)
- [入门指南](#getting-started)
- [剧本](#scripts)
<img src=“assets/images and logos/Download_models.png” alt=“下载模型截图” width=“100%”>

- [投稿人快速入门](#quick-start-for-contributors)
- [路线图](#roadmap)
- [许可证](#license)
### 加载模型
- [致谢](#acknowledgements)
- 下载后，点击模型旁边的 **加载** 以将其加载到内存中。
## 📰 新闻和公告
- ** 🔒 HF 令牌身份验证(v1.9.0,2025 年 4 月)**：使用您的身份验证令牌从 Hugging Face 访问门控模型。

- 您还可以使用聊天输入左侧的 V 形图标直接在聊天页面中加载模型。

- ** 📱 iPad 支持(v1.8.12,2025 年 3 月)**：完全支持 iPad 设备，包括横向。
- ** 👤 Pals 功能(v1.8.0,2025 年 2 月)**：创建具有不同个性的个性化 AI 助手并与之聊天。
- 基准测试🔍工具(v1.6.1,2024)**：使用内置的基准测试功能测试和比较模型性能。
- ** 🎨 新图标提醒(2024 年 11 月)**：PocketPal AI 焕然一新！非常感谢 **[Chun Te Lee](https://github.com/Reeray)** 的设计！[阅读更多](https://github.com/a-ghorbani/pocketpal-ai/discussions/102)。
- ** 🚀 Hugging Face 公共中心集成(v1.5,2024 年 11 月)**：PocketPal AI 现在与 Hugging Face 模型中心集成！直接从应用程序中的 Hugging Face Hub 浏览、下载和运行模型。[阅读详情](https://github.com/a-ghorbani/pocketpal-ai/discussions/104)
### 与模特聊天
## 功能
1. 确保已加载模型。
- **离线 AI 协助**：直接在您的设备上运行语言模型，无需互联网连接。
- **模型灵活性**：下载并在多个 SLM 之间进行切换，包括 Danube 2 和 3、Phi、Gemma 2 和 Qwen。
- **自动卸载/加载**：当应用程序在后台运行时，通过卸载模型来自动管理内存。
- **推理设置**：自定义模型参数，如系统提示符、温度、BOS 令牌和聊天模板。

- **实时性能指标**：在 AI 响应生成期间查看每秒令牌数和每个令牌的毫秒数。

- **消息编辑**：编辑您的消息并重试 AI 生成。

- **个性化伙伴**：使用自定义设置创建不同的 AI 个性。

- **后台下载**：在使用其他应用程序 (iOS) 时继续下载模型。

- **推理期间屏幕处于唤醒状态**：当 AI 生成响应时，保持屏幕开启。

- **多设备支持**：针对手机和平板电脑(包括 iPad)进行了优化。

- **本地化**：以您的首选语言使用应用程序。

- **Hugging Face 集成**：通过身份验证访问公共和门控模型。

2. 从菜单导航到 **聊天** 页面。

## 安装
3. 开始与您的 AI 助手交谈！
### iOS 版
4. 屏幕在推理期间保持唤醒状态，空闲时关闭。
从 App Store 下载 PocketPal AI：
5. 您可以使用聊天输入左侧的 V 形图标选择和加载模型。

[**在 App Store 下载**](https://apps.apple.com/us/app/pocketpal-ai/id6502579498)

<img src=“assets/images and logos/Chat.png” alt=“聊天截图” width=“83%”>

### 安卓
### 复制文本

在 Google Play 上获取 PocketPal AI：

- **复制整个响应**：点击 AI 响应气泡底部的复制图标。
[**在 Google Play 上获取**](https://play.google.com/store/apps/details?id=com.pocketpalai)
- **复制特定段落**：长按段落以复制其内容。
## 用法
*注意*：复制时保留文本格式目前受到限制。我们正在努力改进此功能。

### 下载模型

### 消息编辑

1. 打开应用程序并点击 **菜单** 图标 ()。 ☰
2. 导航到 **模型** 页面。

3. 从列表中选择一个模型，然后点击 **下载**。

4. 或点击 + 按钮添加来自 Hugging Face 或本地下载的模型。

1. 长按您的任何消息以对其进行编辑。
2. 编辑后，AI 将根据您的更改重新生成响应。
3. 使用重试选项在不更改消息的情况下获得新的响应。
4. 您还可以使用其他模型重试生成，以进行比较或获得更好的结果。

### 使用 Pals

1. 创建具有不同个性和设置的个性化 AI 助手。
2. PocketPal 提供两种不同的朋友类型：
- **小伙伴**：选择默认模型，设置系统提示音(手动或由其他 AI 生成)，自定义聊天文本输入颜色。
- **角色扮演伙伴**：类似于 Assistant Pal 加上位置、AI 角色和其他上下文参数的额外设置。
3. 使用聊天页面中的 Pal 选择器选择一个 Pal，以在不同角色之间快速切换。

<div style=“margin-top： 30px; margin-bottom： 30px;”>
<img src=“assets/images and logos/Pals.png” alt=“助理伙伴截图” width=“100%”>
<p><em>创建鸡尾酒配方助手的示例</em></p>
</div>

<div style=“margin-top： 30px; margin-bottom： 30px;”>
<img src=“assets/images and logos/Roleplay.png” alt=“Roleplay Pal Screenshot” width=“33%”>
<p><em>使用自定义参数设置角色扮演伙伴</em></p>
</div>

<div style=“margin-top： 30px; margin-bottom： 30px;”>
<img src=“assets/images and logos/Pals-AI_generates_system_prompt.png” alt=“AI 生成的系统提示” width=“16%”>
<p><em>使用 AI 为您的朋友生成系统提示</em></p>
</div>

### 基准测试

1. 导航到 Benchmarking 页面。
2. 对模型运行性能测试以比较速度和效率。
3. 查看详细指标，例如每秒令牌数和内存使用情况。
4. 在 [PocketPal AI 手机排行榜](https://huggingface.co/spaces/a-ghorbani/ai-phone-leaderboard) 上分享您的基准测试结果并与其他设备进行比较。

<img src=“assets/images and logos/Benchmark.png” alt=“Benchmark Screenshot” width=“100%”>

### 设置 Hugging Face Access Token

通过设置您的身份验证令牌，从 Hugging Face 访问门控模型：

1. 首先，从您的 Hugging Face 帐户获取访问令牌：
- 请参阅 [HF Security Tokens 文档](https://huggingface.co/docs/hub/en/security-tokens)

<img src=“assets/images and logos/Get_token_from_HF.png” alt=“从拥抱脸上获取令牌” width=“1000%”>

2. 在 PocketPal AI 中：
- 导航到 Settings 页面
- 点击“设置令牌”
- 将 personal access token 粘贴到文本输入中
-救

<img src=“assets/images and logos/Token_in_pocketpal.png” alt=“PocketPal 中的令牌设置” width=“66%”>

### 发送反馈

直接从应用程序分享您的想法：

1. 导航到 App Info 页面
2. 点击“分享您的想法”
3. 输入您想要分享的任何内容，从功能请求到建议
4. 点击“提交反馈”

<img src=“assets/images and logos/Send_Feedback.png” alt=“发送反馈截图” width=“50%”>

## 开发设置

有兴趣在本地贡献或运行应用程序吗？请按照以下步骤作。

### 先决条件

- **Node.js**(版本 18 或更高版本)
-**纱**
- **React Native CLI**
- **Xcode**(用于 iOS 开发)
- **Android Studio**(用于 Android 开发)

### 入门

1. **Fork 并克隆仓库**

'''猛击
git clone https://github.com/a-ghorbani/pocketpal-ai
CD PocketPal-AI
```

2. **安装依赖项**

'''猛击
yarn 安装
```

3. **安装 Pod 依赖项(仅限 iOS)**

'''猛击
CD iOS
Pod 安装
CD ..
```

4. **运行应用程序**

- **iOS 模拟器**

'''猛击
纱线 iOS
```

- **Android 模拟器**

'''猛击
纱线安卓
```

### 脚本

- **启动 Metro Bundler**

'''猛击
纱线起点
```

- **干净的构建工件**

'''猛击
纱线清洁
```

- **lint 和类型检查**

'''猛击
纱棉
纱线类型检查
```

- **运行测试**

'''猛击
纱线测试
```

## 贡献

我们欢迎所有贡献！在开始之前，请阅读我们的 [贡献指南](CONTRIBUTING.md) 和 [行为准则](./CODE_OF_CONDUCT.md)。

### 贡献者快速入门

1. **复刻仓库**
2. **创建新分支**

'''猛击
git checkout -b 功能/您的功能名称
```

3. **做出您的改变**
4. **测试您的更改**

- **在 iOS 上运行**

'''猛击
纱线 iOS
```

- **在 Android 上运行**

'''猛击
纱线安卓
```

5. **lint 和类型检查**

'''猛击
纱棉
纱线类型检查
```

6. **提交您的更改**

- 遵循 Conventional 提交格式：

'''猛击
git commit -m “feat： 添加新模型支持”
```

7. 推送并打开一个 Pull Request**

'''猛击
git push origin feature/your-feature-name
```

## 路线图

- **新模型**：添加对更多微型 LLM 的支持。
- **UI/UX 增强功能**：继续改进整体用户界面和用户体验。
- **改进的文档**：增强项目的文档。
- **性能优化**：进一步优化不同设备类型的性能。
- **更多语言**：通过本地化添加对其他语言的支持。
- **增强的错误处理**：改进错误处理和恢复机制。

请随时打开 issue 以建议功能或报告 Bug。

## 许可证

本项目采用 [MIT License](LICENSE) 授权。

## 联系方式

如有疑问或反馈，请打开一个问题。

## 致谢

PocketPal AI 是使用以下方面的出色工作构建的：

- **[llama.cpp](https://github.com/ggerganov/llama.cpp)**：在本地设备上实现 LLM 的高效推理。
- **[llama.rn](https://github.com/mybigday/llama.rn)**： 在 React Native 中实现 llama.cpp 绑定。
- **[React Native](https://reactnative.dev/)**：支持跨平台移动体验的框架。
- **[MobX](https://mobx.js.org/)**： 状态管理库，保持应用的响应性和性能。
- **[React Native Paper](https://callstack.github.io/react-native-paper/)**： 用于 UI 的 Material Design 组件。
- **[React Navigation](https://reactnavigation.org/)**：应用程序屏幕的路由和导航。
- **[Gorhom Bottom Sheet](https://github.com/gorhom/react-native-bottom-sheet)**：为整个应用程序中平滑的底部工作表交互提供支持。
- **[@dr.pogodin/react-native-fs](https://github.com/birdofpreyru/react-native-fs)**：支持模型下载和管理的文件系统访问。

以及许多其他使该项目成为可能的开源库！

---

祝您探索愉快！🚀📱✨
