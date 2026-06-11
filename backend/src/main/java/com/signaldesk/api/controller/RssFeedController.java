package com.signaldesk.api.controller;

import com.signaldesk.application.service.RssCollectionService;
import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.RssFeed;
import com.signaldesk.domain.repository.RssFeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rss-feeds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RssFeedController {

    private final RssFeedRepository rssFeedRepository;
    private final RssCollectionService rssCollectionService;

    @GetMapping
    public List<RssFeed> list() {
        return rssFeedRepository.findAll();
    }

    @PostMapping
    public RssFeed create(@RequestBody Map<String, String> body) {
        return rssFeedRepository.save(RssFeed.builder()
            .name(body.get("name"))
            .url(body.get("url"))
            .category(body.get("category"))
            .enabled(true)
            .build());
    }

    @PatchMapping("/{id}/toggle")
    public RssFeed toggle(@PathVariable Long id) {
        RssFeed feed = rssFeedRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Feed not found: " + id));
        feed.setEnabled(!feed.getEnabled());
        return rssFeedRepository.save(feed);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rssFeedRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/collect")
    public Map<String, Integer> collect() {
        List<NewsArticle> articles = rssCollectionService.collectAll();
        return Map.of("collected", articles.size());
    }
}
