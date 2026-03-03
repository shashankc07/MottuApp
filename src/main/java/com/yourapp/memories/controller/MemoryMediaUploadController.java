package com.yourapp.memories.controller;

import com.yourapp.memories.dto.MemoryMediaDto;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/memories/media")
public class MemoryMediaUploadController {

    private final Path uploadRoot;

    public MemoryMediaUploadController() throws IOException {
        this.uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);
    }

    @PostMapping("/upload")
    public ResponseEntity<MemoryMediaDto> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "file";
        }
        String originalFilename = StringUtils.cleanPath(originalName);
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex != -1) {
            extension = originalFilename.substring(dotIndex);
        }
        String lowerExt = extension.toLowerCase();

        // Supported: .jpg, .jpeg (any case), .heic, .heif (converted to jpg)
        boolean isJpeg = lowerExt.equals(".jpg") || lowerExt.equals(".jpeg");
        boolean needsConversion = lowerExt.equals(".heic") || lowerExt.equals(".heif");
        if (!isJpeg && !needsConversion) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        String targetExtension;
        if (needsConversion) {
            targetExtension = ".jpg";
        } else {
            targetExtension = ".jpg"; // normalize jpeg/jpg to .jpg
        }

        String filename = UUID.randomUUID() + targetExtension;
        Path target = uploadRoot.resolve(filename);

        if (needsConversion) {
            try (InputStream in = file.getInputStream()) {
                BufferedImage image = ImageIO.read(in);
                if (image == null) {
                    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
                }
                ImageIO.write(image, "jpg", Files.newOutputStream(target));
            }
        } else {
            Files.copy(file.getInputStream(), target);
        }

        String url = "/uploads/" + filename;

        MemoryMediaDto dto = new MemoryMediaDto();
        dto.setType("PHOTO");
        dto.setUrl(url);
        dto.setThumbnailUrl(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}

