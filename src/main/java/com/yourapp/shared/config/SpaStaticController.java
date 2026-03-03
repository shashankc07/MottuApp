package com.yourapp.shared.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves Next.js static export index pages for paths that end with /.
 * Spring Boot does not serve auth/index.html for GET /auth/ by default.
 */
@RestController
public class SpaStaticController {

    @GetMapping(value = "/auth/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> authPage() {
        Resource resource = new ClassPathResource("static/auth/index.html");
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(resource);
    }
}
