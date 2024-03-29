package org.example.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.entities.Book;
import org.example.entities.User;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookDto implements Serializable {

    private Long book_id;
    private String title;
    private String authors;
    private String published;
    private String description;
    private String smallThumbnail;
    private String thumbnail;
    private boolean bookshelf;
    private String review;
    private String infoLink;
    private UserDto userDto;

    public BookDto(Book book) {
        if(book.getBook_id() != null){
            this.book_id = book.getBook_id();
        }
        if(book.getTitle() != null){
            this.title = book.getTitle();
        }
        if(book.getAuthors() != null){
            this.authors = book.getAuthors();
        }
        if(book.getPublished() != null){
            this.published = book.getPublished();
        }
        if(book.getDescription() != null){
            this.description = book.getDescription();
        }
        if(book.getSmallThumbnail() != null){
            this.smallThumbnail = book.getSmallThumbnail();
        }
        if(book.getThumbnail() != null){
            this.thumbnail = book.getThumbnail();
        }
        if(book.isBookshelf()){
            this.bookshelf = true;
        }
        if(book.getReview() != null){
            this.review = book.getReview();
        }
        if(book.getInfoLink() != null){
            this.infoLink = book.getInfoLink();
        }

        // set user dto data. UserDTO is passing in and out to client
        this.userDto = new UserDto();
        this.userDto.setFirstname(book.getUser().getFirstname());
        this.userDto.setUser_id((book.getUser().getUser_id()));

    }
}
