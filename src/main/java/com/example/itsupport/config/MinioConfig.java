//package com.example.itsupport.config;
//
//import org.springframework.boot.context.properties.EnableConfigurationProperties;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import io.minio.MinioClient;              // ← добавьте эту строку
//import io.minio.BucketExistsArgs;
//import io.minio.MakeBucketArgs;
//
//@Configuration
//@EnableConfigurationProperties(S3Props.class)
//public class MinioConfig {
//
//    @Bean
//    MinioClient minio(S3Props p) {
//        return MinioClient.builder()
//                .endpoint(p.getEndpoint())
//                .credentials(p.getAccessKey(), p.getSecretKey())
//                .build();
//    }
//
//    /** Автоматически создаём бакет при старте (удобно для dev-MinIO) */
//    @EventListener(ApplicationReadyEvent.class)
//    public void createBucketIfNeeded(S3Props p, MinioClient client) throws Exception {
//        boolean exists = client.bucketExists(BucketExistsArgs.builder()
//                .bucket(p.getBucket()).build());
//        if (!exists) client.makeBucket(MakeBucketArgs.builder()
//                .bucket(p.getBucket()).build());
//    }
//}
//
