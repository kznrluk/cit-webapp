#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define XU 3
#define YU 3

struct stage{
    int num[XU][YU];
    int sx;
    int sy;
    int count;
};

void firstentry (struct stage *map);
int  continuation (struct stage *map, int, int);
void moving (struct stage *map, int, int);
int  judge (struct stage *map, int, int);
void outputhtml (struct stage);
void header (void);
void footer (void);
int  outputdata (struct stage);

int main (int argc, char *argv[]){
    // �e��錾 �x�����o��̂ňꉞ���������Ă����B
    int i, u;
    struct stage map;
    for(i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            map.num[i][u] = 0;
        }
    }

    map.count = 0;
    map.sx = 0;
    map.sy = 0;
    // ��������
    if(argc == 3){
        // ����������ꍇ�A�t�@�C����ǂݍ��ށB
        continuation(&map, atoi(argv[1]), atoi(argv[2]));
    } else if (argc == 1) {
        // �������Ȃ��ꍇ�A����N�������Ɉڍs�B
        firstentry(&map);
    } else {
        printf("�����̒l���s���ł��B\n");
        return -1;
    }
    // HTML�̏o��
    outputhtml(map);
    // �t�@�C���̏o��
    outputdata(map);
    return 0;
}

void firstentry (struct stage *map){
    int mapseed[XU*YU];
    int i, u, e, j, t;
    // �܂��z���0,1,2... �Ɗi�[����B
    for(i = 0; i < XU*YU; i++){
        mapseed[i] = i;
    }
    // ������V���b�t������B
    for(i = 0; i < XU*YU; i++) {
        j = rand()%XU*YU;
        t = mapseed[i];
        mapseed[i] = mapseed[j];
        mapseed[j] = t;
    }
    // �o���o���ɂȂ���������z��Ɋi�[����B
    for(e = 0 , i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            map->num[i][u] = mapseed[e];
            e++;
        }
    }
    // �E����󔒂ɂ���B
    map->num[0][0] = -1;
    map->sx = 0;
    map->sy = 0;
}

int continuation (struct stage *map, int x, int y){
    int i, u;
    // �t�@�C���̓ǂݍ���
    FILE *fd;
    char fmap[32];
    fd = fopen("./temp/stage.dat","r");
    if(fd == NULL) {
        printf("File Pointer is NULL");
        return -1;
    }
    fgets(fmap, 32, fd);
    // �ۑ������z��̓��e��ǂݍ���
    for(i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            if (i == 0 && u == 0){
                map->num[0][0] = atoi(strtok(fmap, ","));
            } else {
                map->num[i][u] = atoi(strtok(NULL, ","));
            }
            // 0�̈ʒu���L��
            if (map->num[i][u] == -1){
                map->sx = i;
                map->sy = u;
            }
        }
    }
    map->count = atoi(strtok(NULL, ",")) + 1;
    fclose(fd);
    // �z��𓮂����B
    moving(map, x, y);
    return 0;
}

void moving (struct stage *map, int x, int y){
    // Judge���g�p���ړ��������s���B
    if(judge(map, x, y)){
        map->num[map->sx][map->sy] = map->num[x][y];
        map->num[x][y] = -1;
        map->sx = x;
        map->sy = y;
    }
}

int judge (struct stage *map, int x, int y){
    if ((x == map->sx && y == map->sy - 1) || (x == map->sx && y == map->sy + 1)
     || (y == map->sy && x == map->sx + 1) || (y == map->sy && x == map->sx - 1)){
        return 1;
    } else {
        return 0;
    }
}

void outputhtml (struct stage map){
    // �e��錾
    int i, u;
    // �w�b�_�̏o��
    header();
    // �{�f�B�̏o��
    printf("<table>\n");
    for (i = 0; i < XU; i++){
        printf("<tr>\n");
        for (u = 0; u < YU; u++){
            if (map.num[i][u] == -1){
                // �󔒃}�X�͋󔒕\��
                printf("<td></td>\n");
            } else {
                // �u����ꏊ�ɂ̓����N��\��B
                printf("<td>");
                if (judge(&map, i, u)){
                    printf("<a href='puzzle.cgi?%d?%d'>", i, u);
                }
                printf("<img src='./temp/slide-%d.png'></td>\n", map.num[i][u]);
            }
        }
    }
    printf("</table>\n");
    printf("<h2>���݂̃X�R�A:%3d</h2>\n", map.count);
    // �t�b�^�̏o��
    footer();
}

void header(void){
    printf("Content-type: text/html; charset=shift_jis\n\n");
    printf("<!DOCTYPE html>\n");
    printf("<html>\r\n");
    printf("<meta charset=\"utf-8\">\n");
    printf("<title>SlidePuzzle.cgi</title>\n");
    printf("<link href=\"css/bootstrap.css\" rel=\"stylesheet\">\n");
    printf("</head>\n");
    printf("<body>\n");
    printf("<h1>SlidePuzzle with CGI/C</h1><br>\n");
}

void footer(void){
    printf("</body>\n");
    printf("</html>\n");
}
int outputdata(struct stage map){
    // �f�[�^�o��
    int i, u;
    FILE *fp;
    fp = fopen("./temp/stage.dat","w");
    for (i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            fprintf(fp, "%d,", map.num[i][u]);
        }
    }
    fprintf(fp, "%d,E", map.count);
    fclose(fp);
    return 0;
}