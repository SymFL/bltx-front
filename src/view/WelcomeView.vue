<template>
  <div class="welcome">
    <img src="../assets/welcome_view.jpg" alt="Welcome Image" class="welcome-image">
    <div class="text-content">
      <h1>欢迎使用病例图像分类系统！</h1>
      <p>本系统提供病理组织图像分类功能，目前支持预测的组织类别分别为：</p>
      <p>脂肪组织、背景、碎屑、淋巴细胞、黏液组织、平滑机组织、正常结肠粘膜、肿瘤相关间质组织以及结直肠腺癌上皮组织</p>
      <p>使用预测功能请上传 tif 或者 tiff 格式的图片，其他图片是不被允许的</p>
      <p>注意：图片像素为 224x224 最贴合本系统的使用</p>

    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeView',
}
</script>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-image {
  width: 35%;
  object-fit: cover;
}

.text-content {
  text-align: center;
}

.text-content h1 {
  color: #3c3c3c;
  font-size: 2.5em;
}

.text-content p {
  color: #7a7a7a;
  font-size: 1.2em;
}
</style>