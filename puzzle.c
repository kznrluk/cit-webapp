#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#define MAXGAMESIZEX 10
#define MAXGAMESIZEY 10

int XU;
int YU;

struct stage{
    int num[MAXGAMESIZEX][MAXGAMESIZEY];
    int sx;
    int sy;
    int count;
    int clear;
    char user[124];
};

void firstentry (struct stage *map);
int  continuation (struct stage *map, int, int);
void moving (struct stage *map, int, int);
int  judge (struct stage *map, int, int);
void outputhtml (struct stage);
int  ifclear (struct stage);
int  outputdata (struct stage);
void header (struct stage map);
void writecookie (struct stage map);
void readcookie(struct stage map);
void footer (struct stage map);

int main (int argc, char *argv[]){
    int i, u;
    XU = 3;
    YU = 3;
    struct stage map;
    for(i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            map.num[i][u] = 0;
        }
    }
    map.count = 0;
    map.sx = 0;
    map.sy = 0;
    map.clear = 0;
    strcpy(map.user,"kznr_luk");

    if(argc >= 3){
        if(argc == 4) strcpy(map.user,argv[3]);
        continuation(&map, atoi(argv[1]), atoi(argv[2]));
    } else if(argc == 2) {
        strcpy(map.user,argv[1]);
        firstentry(&map);
    } else if(argc == 1) {
        firstentry(&map);
    } else {
        printf("Arg Error.\n");
        return -1;
    }
    outputhtml(map);
    outputdata(map);
    return 0;
}

void firstentry (struct stage *map){
    int mapseed[XU*YU];
    int i, u, e, j, t;
    srand((unsigned) time(NULL));
    for(i = 0; i < XU*YU; i++){
        mapseed[i] = i;
    }
    for(i = 0; i < XU*YU; i++) {
        j = rand()%XU*YU;
        t = mapseed[i];
        mapseed[i] = mapseed[j];
        mapseed[j] = t;
    }
    for(e = 0 , i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            map->num[i][u] = mapseed[e];
            e++;
        }
    }
    map->num[0][0] = -1;
    map->sx = 0;
    map->sy = 0;
}

int continuation (struct stage *map, int x, int y){
    int i, u;
    char *cookie;

    if((cookie = getenv("HTTP_COOKIE")) != NULL) {
        printf("%s",cookie);
    }

    FILE *fd;
    char fmap[32];
    char pass[64];

    sprintf(pass,"./slices/%s/stage.dat",map->user);

    fd = fopen(pass,"r");
    if(fd == NULL) {
        printf("File Pointer is NULL");
        return -1;
    }
    fgets(fmap, 32, fd);
    for(i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            if (i == 0 && u == 0){
                map->num[0][0] = atoi(strtok(fmap, ","));
            } else {
                map->num[i][u] = atoi(strtok(NULL, ","));
            }
            if (map->num[i][u] == -1){
                map->sx = i;
                map->sy = u;
            }
        }
    }
    map->count = atoi(strtok(NULL, ",")) + 1;
    fclose(fd);
    moving(map, x, y);
    map->clear = ifclear(*map);
    return 0;
}

void moving (struct stage *map, int x, int y){
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
    int i, u;
    header(map);
    printf("<table class=\"mx-auto\">\n");
    for (i = 0; i < XU; i++){
        printf("<tr>\n");
        for (u = 0; u < YU; u++){
            if (map.num[i][u] == -1){
                printf("<td></td>\n");
            } else {
                printf("<td>");
                if (judge(&map, i, u) && map.clear == 0){
                    printf("<a href='puzzle.cgi?%d+%d+%s'>", i, u, map.user);
                }
                printf("<img src='./slices/%s/slide-%d.png'></td>\n", map.user, map.num[i][u]);
            }
        }
    }
    printf("</table>\n");
    footer(map);
}

int ifclear(struct stage map){
    int i, u;
    int count = 0;
    int s = 0;
    for(i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            if(map.num[i][u] == count){
                s++;
            }
            count++;
        }
    }
    if (s == XU*YU - 1){
        return 1;
    } else {
        return 0;
    }
}

void header(struct stage map){
    //printf("Content-Type: text/html charset=utf-8;\n");
    //writecookie(map);
    //printf("\n");
printf("<!DOCTYPE html>\n\
<html>\n\
<head>\n\
    <title>Twitter Puzzle</title>\n\
    <link href=\"css/bootstrap.min.css\" rel=\"stylesheet\">\n\
    <link href=\"css/chocolate.css\" rel=\"stylesheet\">\n\
    <link href=\"https://fonts.googleapis.com/css?family=Modak|Titillium+Web\" rel=\"stylesheet\">\n");
    if(map.clear){
        printf("\
    <SCRIPT language=\"JavaScript\">\n\
    <!--\n\
    function jumpPage() {\n\
        location.href = \"#clear\";\n\
    }\n\
    setTimeout(\"jumpPage()\",10)\n\
    //-->\n\
    </SCRIPT>\n");
    }
printf("</head>\n");
printf("<body>\n\
    <div id=\"contents\">\n\
    <h1 class=\"text-center title\">Twitter Puzzle</h1><br>\n\
    <div id=\"modal\">\n\
        <div id=\"clear\">\n\
            <a href=\"#\" class=\"close_overlay\">x</a>\n\
            <div class=\"modal_window\">\n\
                <h2 class=\"type-shine\">Congratulation!</h2>\n\
                <p class=\"scores\">Your Score : %d</p>\n\
                <a class=\"twitter-share-button\"\n\
                    href=\"https://twitter.com/intent/tweet?text=txt\"\n\
                    data-size=\"large\">Tweet\n\
                </a>\n\
            </div>\n\
        </div>\n\
    </div>\n\
    <div class=\"jumbotron\">\n", map.count);
}

void footer(struct stage map){
printf("\
        <div class=\"container\">\n\
            <div class=\"row\">\n\
                <div class=\"col-md-3 mx-auto text-center\">\n\
                    <p class=\"score\">Score : %d</p>\n\
                </div>\n\
                <div class=\"col-md-3 mx-auto text-center\">\n\
                    <a href=\"./puzzle.cgi+%s\"><button type=\"button\" class=\"btn btn-outline-success button\">Reset</button></a>\n\
                </div>\n\
            </div>\n\
        </div>\n\
    </div>\n\
    <footer class=\"footer\">\n\
        <div class=\"container\">\n\
            <p class=\"footertext\">SlidePuzzle created by K. Sasa.</p>\n\
        </div>\n\
    </footer>\n\
    </div>\n\
</body>\n\
</html>\n", map.count, map.user);
}

int outputdata(struct stage map){
    int i, u;
    char pass[64];
    FILE *fp;
    sprintf(pass,"./slices/%s/stage.dat",map.user);
    fp = fopen(pass,"w");
    for (i = 0; i < XU; i++){
        for(u = 0; u < YU; u++){
            fprintf(fp, "%d,", map.num[i][u]);
        }
    }
    fprintf(fp, "%d,E", map.count);
    fclose(fp);
    return 0;
}