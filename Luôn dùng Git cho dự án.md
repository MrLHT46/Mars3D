### Luôn dùng Git cho dự án (mục đích rollback)

# Đẩy vào git:
git init
git add .
git commit -m "initial"

# Khôi phục
git restore .
# hoặc
git reset --hard

# Tạo nhánh mới
git branch <new_branch_name>

# Chuyển sang nhánh mới
git checkout <new_branch_name>

# Hợp nhất nhánh
git merge <branch_to_merge>

# Xem lịch sử commit
git log

# Xem trạng thái file
git status

# Xóa file khỏi staging area nhưng giữ lại trong thư mục làm việc
git rm --cached <file_name>

# Xóa file khỏi staging area và thư mục làm việc
git rm <file_name>

# Đổi tên file
git mv <old_file_name> <new_file_name>

# Đẩy code lên remote repository
git push origin <branch_name>

# Kéo code từ remote repository
git pull origin <branch_name>

# Clone một repository
git clone <repository_url>

# Cấu hình user name và email
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"



# Tạo và chuyển sang nhánh mới
git checkout -b <new_branch_name>

# Thêm remote repository
git remote add origin <remote_repository_url>

# Lấy tất cả các nhánh từ remote
git fetch

# Xem các remote đã cấu hình
git remote -v

# Xóa remote
git remote remove <remote_name>

# Hoàn tác commit cuối cùng (giữ lại thay đổi)
git reset HEAD~1

# Hoàn tác commit cuối cùng (xóa thay đổi)
git reset --hard HEAD~1

# Hoàn tác một commit cụ thể (tạo commit mới để revert)
git revert <commit_hash>

# Stash các thay đổi hiện tại
git stash

# Áp dụng lại các thay đổi đã stash
git stash pop

# Xem các stash đã lưu
git stash list

# Xóa stash
git stash drop

# So sánh các thay đổi
git diff

# So sánh giữa staging area và commit cuối cùng
git diff --staged

# So sánh giữa hai nhánh
git diff <branch1> <branch2>

# Xem lịch sử commit với đồ thị
git log --graph --oneline --all

# Thay đổi commit cuối cùng
git commit --amend

# Đặt lại nhánh về một commit cụ thể
git reset <commit_hash>

# Đặt lại nhánh và xóa các thay đổi
git reset --hard <commit_hash>

# Xóa nhánh cục bộ
git branch -d <branch_name>

# Xóa nhánh remote
git push origin --delete <branch_name>

# Lấy các thay đổi từ remote và hợp nhất
git pull

# Lấy các thay đổi từ remote mà không hợp nhất
git fetch

# Hợp nhất (rebase) nhánh hiện tại lên nhánh khác
git rebase <base_branch>

# Giải quyết xung đột hợp nhất
# Sau khi sửa file, dùng:
git add .
git rebase --continue

# Hủy rebase
git rebase --abort

