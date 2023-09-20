import gradio as gr

#app 1
def user_greeting(name):
    return "Hi! " + name + " Welcome !!😎"

#app 2
def user_help(value):
    return f"you pick {value} "

def tags3(img):

    return img

def tags4(text):
    return text

def tags5(text):
    return text


# tags1的输入、输出，以及对应处理函数
app1 =  gr.Interface(fn = user_greeting, inputs="text", outputs="text", description="根据个人兴趣，及其目的地，个性化推荐旅游路线，制定大致旅游路线。")
# tags1的输入、输出，以及对应处理函数
app2 =  gr.Interface(fn = user_help, inputs="slider", outputs="text")
# tags1的输入、输出，以及对应处理函数
app3 =  gr.Interface(fn = tags3, inputs="image", outputs="image")
# tags1的输入、输出，以及对应处理函数
app4 =  gr.Interface(fn = tags4, inputs="text", outputs="text")
app5 =  gr.Interface(fn = tags5, inputs="text", outputs="image")


demo = gr.TabbedInterface(
                          [app1, app2,app3, app4, app5],
                          tab_names=["旅行计划定制", "旅游照片风格化","旅游视频生成","旅行文案生成", "旅行手帐生成"],
                          title="旅小鲸🐳助手-这是一个程序猿解放旅游玩伴双手的全能工具🔧, 技术改变世界🌍的狭小梦想",
                          )
demo.launch(inbrowser=True,  # 自动打开默认浏览器
            show_tips=True,  # 自动显示gradio最新功能
            share=True,  # 项目共享，其他设备可以访问
            show_error=True,  # 在浏览器控制台中显示错误信息
            quiet=True,  # 禁止大多数打印语句
            )
