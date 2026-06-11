package com.signaldesk.application.service;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import com.signaldesk.domain.entity.NewsArticle;
import com.signaldesk.domain.entity.RssFeed;
import com.signaldesk.domain.repository.NewsArticleRepository;
import com.signaldesk.domain.repository.RssFeedRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RssCollectionService {

    private final RssFeedRepository rssFeedRepository;
    private final NewsArticleRepository newsArticleRepository;

    @Transactional
    public List<NewsArticle> collectAll() {
        List<RssFeed> feeds = rssFeedRepository.findByEnabledTrue();
        List<NewsArticle> collected = new ArrayList<>();

        for (RssFeed feed : feeds) {
            try {
                List<NewsArticle> articles = collectFeed(feed);
                collected.addAll(articles);
                log.info("RSS 수집 완료: {} - {}건", feed.getName(), articles.size());
            } catch (Exception e) {
                log.warn("RSS 수집 실패: {} - {}", feed.getName(), e.getMessage());
            }
        }
        log.info("전체 RSS 수집 완료: 총 {}건", collected.size());
        return collected;
    }

    private List<NewsArticle> collectFeed(RssFeed feed) throws Exception {
        List<NewsArticle> result = new ArrayList<>();
        SyndFeedInput input = new SyndFeedInput();
        SyndFeed syndFeed = input.build(new XmlReader(new URL(feed.getUrl())));

        for (SyndEntry entry : syndFeed.getEntries()) {
            String url = entry.getLink();
            if (url == null || newsArticleRepository.findByUrl(url).isPresent()) {
                continue;
            }

            String content = "";
            if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                content = entry.getContents().get(0).getValue();
            } else if (entry.getDescription() != null) {
                content = entry.getDescription().getValue();
            }

            LocalDateTime publishedAt = toLocalDateTime(entry.getPublishedDate());

            NewsArticle article = NewsArticle.builder()
                .source(feed.getName())
                .title(entry.getTitle() != null ? entry.getTitle().trim() : "")
                .url(url)
                .publishedAt(publishedAt != null ? publishedAt : LocalDateTime.now())
                .content(stripHtml(content))
                .category(feed.getCategory())
                .importanceScore(0)
                .build();

            result.add(newsArticleRepository.save(article));
        }
        return result;
    }

    private LocalDateTime toLocalDateTime(Date date) {
        if (date == null) return null;
        return date.toInstant().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "").replaceAll("&[a-zA-Z]+;", " ").trim();
    }
}
